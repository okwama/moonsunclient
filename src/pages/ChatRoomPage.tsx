// NOTE: You may need to install socket.io-client: npm install socket.io-client
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface ChatRoom {
  id: number;
  name: string | null;
  is_group: boolean;
  created_by: number;
  created_at: string;
}

interface Message {
  id?: number;
  room_id: number;
  sender_id: number;
  sender_name?: string;
  message: string;
  sent_at?: string;
}

interface Staff {
  id: number;
  name: string;
}

const ChatRoomPage: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Fetch chat rooms for user
  const fetchRooms = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/chat/my-rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRooms(res.data);
  };

  // Fetch messages for a room
  const fetchMessages = async (roomId: number) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/chat/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessages(res.data);
  };

  // Fetch all staff for group creation
  const fetchStaff = async () => {
    const res = await axios.get(`${API_URL}/staff`, { withCredentials: true });
    setAllStaff(res.data);
  };

  // Initialize socket
  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [user]);

  // Join/leave room on selection
  useEffect(() => {
    if (!selectedRoom || !socketRef.current) return;
    socketRef.current.emit('joinRoom', selectedRoom.id);
    fetchMessages(selectedRoom.id);
    // Listen for new messages
    socketRef.current.on('newMessage', (msg: Message) => {
      if (msg.room_id === selectedRoom.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      socketRef.current?.emit('leaveRoom', selectedRoom.id);
      socketRef.current?.off('newMessage');
    };
    // eslint-disable-next-line
  }, [selectedRoom]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => { fetchRooms(); fetchStaff(); }, []);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !user) return;
    // Emit to socket with correct property names
    socketRef.current?.emit('sendMessage', {
      roomId: selectedRoom.id,
      sender_id: user.id,
      sender_name: user.username || 'You',
      message: newMessage.trim(),
      sentAt: new Date().toISOString(),
    });
    // Save to backend
    const token = localStorage.getItem('token');
    await axios.post(`${API_URL}/chat/rooms/${selectedRoom.id}/messages`, { roomId: selectedRoom.id, message: newMessage }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNewMessage('');
    // Show toast notification
    setToast('Message sent!');
    setTimeout(() => setToast(null), 2000);
  };

  // Create group chat
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedStaff.length === 0) return;
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/chat/rooms`, {
      name: groupName,
      is_group: true,
      memberIds: selectedStaff,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setShowCreateModal(false);
    setGroupName('');
    setSelectedStaff([]);
    // Fetch rooms and select the new one
    await fetchRooms();
    // Find the new room by id (from response) or by name
    const newRoomId = res.data.roomId;
    const newRoom = rooms.find(r => r.id === newRoomId) || (await axios.get(`${API_URL}/chat/my-rooms`, { headers: { Authorization: `Bearer ${token}` } })).data.find((r: any) => r.id === newRoomId);
    if (newRoom) setSelectedRoom(newRoom);
    // Show toast notification
    setToast('Group chat created!');
    setTimeout(() => setToast(null), 2000);
  };

  // Edit message handler
  const handleEditMessage = (msg: Message) => {
    setEditingMessageId(msg.id!);
    setEditMessageText(msg.message);
  };

  const handleEditMessageSave = async (msg: Message) => {
    const token = localStorage.getItem('token');
    await axios.patch(`${API_URL}/chat/messages/${msg.id}`, { message: editMessageText }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessages((prev) => prev.map(m => m.id === msg.id ? { ...m, message: editMessageText } : m));
    setEditingMessageId(null);
    setEditMessageText('');
  };

  const handleEditMessageCancel = () => {
    setEditingMessageId(null);
    setEditMessageText('');
  };

  // Delete message handler
  const handleDeleteMessage = async (msg: Message) => {
    if (!window.confirm('Delete this message?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/chat/messages/${msg.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessages((prev) => prev.filter(m => m.id !== msg.id));
  };

  return (
    <div className="flex h-[80vh] bg-white rounded shadow overflow-hidden">
      {/* Sidebar: Room List */}
      <div className="w-1/4 border-r p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Chats</h2>
          <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm" onClick={() => setShowCreateModal(true)}>+ Group</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.map(room => (
            <div
              key={room.id}
              className={`p-2 rounded cursor-pointer mb-2 ${selectedRoom?.id === room.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedRoom(room)}
            >
              {room.is_group ? (room.name || 'Group Chat') : 'Private Chat'}
            </div>
          ))}
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 font-semibold">
          {selectedRoom ? (selectedRoom.is_group ? (selectedRoom.name || 'Group Chat') : 'Private Chat') : 'Select a chat room'}
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {selectedRoom ? (
            <>
              {messages.map((msg, idx) => {
                // Only allow edit/delete if there is no later message from another user
                let canEditOrDelete = false;
                if (msg.sender_id === user?.id) {
                  // Check if all later messages are from the same user
                  canEditOrDelete = messages.slice(idx + 1).every(m => m.sender_id === user.id);
                }
                return (
                  <div key={idx} className={`mb-2 flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3 py-2 rounded-lg max-w-xs relative ${msg.sender_id === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                      <div className="text-xs font-bold mb-1">{msg.sender_name || (msg.sender_id === user?.id ? (user.username || 'You') : 'User')}</div>
                      {editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            className="border rounded px-2 py-1 text-black"
                            value={editMessageText}
                            onChange={e => setEditMessageText(e.target.value)}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-1">
                            <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs" onClick={() => handleEditMessageSave(msg)}>Save</button>
                            <button className="px-2 py-1 bg-gray-300 text-black rounded text-xs" onClick={handleEditMessageCancel}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>{msg.message}</div>
                          {msg.sent_at && <div className="text-[10px] text-right text-gray-200 mt-1">{new Date(msg.sent_at).toLocaleTimeString()}</div>}
                          {canEditOrDelete && (
                            <div className="absolute top-1 right-1 flex gap-1">
                              <button title="Edit" onClick={() => handleEditMessage(msg)} className="p-1 hover:bg-blue-700 rounded"><Pencil size={14} /></button>
                              <button title="Delete" onClick={() => handleDeleteMessage(msg)} className="p-1 hover:bg-blue-700 rounded"><Trash2 size={14} /></button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-gray-400 text-center mt-10">Select a chat room to start messaging</div>
          )}
        </div>
        {selectedRoom && (
          <form onSubmit={handleSend} className="flex p-4 border-t">
            <input
              className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r">Send</button>
          </form>
        )}
      </div>
      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Create Group Chat</h3>
            <form onSubmit={handleCreateGroup}>
              <input
                className="w-full border rounded px-3 py-2 mb-3"
                placeholder="Group Name"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
              />
              <div className="mb-3 max-h-40 overflow-y-auto border rounded p-2">
                {allStaff.map(staff => (
                  <label key={staff.id} className="block cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(staff.id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedStaff(prev => [...prev, staff.id]);
                        else setSelectedStaff(prev => prev.filter(id => id !== staff.id));
                      }}
                    />{' '}{staff.name}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-3 py-1 rounded bg-gray-200" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="px-3 py-1 rounded bg-blue-500 text-white">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
};

export default ChatRoomPage; 
import React, { useEffect, useState } from 'react';
import StatCard from '../components/Dashboard/StatCard';
import { UsersIcon, AlertTriangle, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { useRef, useCallback } from 'react';
import { format } from 'date-fns';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format as formatDate,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Simple calendar and task state
const getToday = () => format(new Date(), 'yyyy-MM-dd');

const HrDashboardPage: React.FC = () => {
    const [attendance, setAttendance] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expiringContracts, setExpiringContracts] = useState<any[]>([]);
    const [hasNewChatMessage, setHasNewChatMessage] = useState(() => {
        return localStorage.getItem('hasNewChatMessage') === 'true';
    });
    const navigate = useNavigate();
    const location = useLocation();
    const socketRef = React.useRef<any>(null);

    // Calendar/task state
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [tasks, setTasks] = useState<{ [date: string]: { id: number; text: string }[] }>({});
    const [newTask, setNewTask] = useState('');
    const nextTaskId = useRef(1);

    // Calendar grid logic
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(monthStart);
    const weekStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarRows: Date[][] = [];
    let day = weekStart;
    while (day <= weekEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      calendarRows.push(week);
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [attendanceRes, staffRes, contractsRes] = await Promise.all([
                fetch('/api/attendance/today'),
                fetch('/api/staff'),
                fetch('/api/staff/contracts/expiring')
            ]);
            const attendanceData = await attendanceRes.json();
            const staffData = await staffRes.json();
            const contractsData = await contractsRes.json();
            setAttendance(attendanceData);
            setStaff(staffData);
            setExpiringContracts(contractsData);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Listen for new chat messages
    useEffect(() => {
        const socket = io(SOCKET_URL);
        socketRef.current = socket;
        socket.on('newMessage', (msg: any) => {
            // Only show notification if not already on chat room page
            if (location.pathname !== '/chat-room') {
                setHasNewChatMessage(true);
                localStorage.setItem('hasNewChatMessage', 'true');
            }
        });
        return () => { socket.disconnect(); };
    }, [location.pathname]);

    // Clear notification when visiting chat room
    useEffect(() => {
        if (location.pathname === '/chat-room') {
            setHasNewChatMessage(false);
            localStorage.setItem('hasNewChatMessage', 'false');
        }
    }, [location.pathname]);

    // Fetch tasks for the current month
    const fetchTasks = useCallback(async () => {
      const month = format(monthStart, 'yyyy-MM');
      const res = await fetch(`/api/calendar-tasks?month=${month}`);
      const data = await res.json();
      // Group by date
      const grouped: { [date: string]: { id: number; text: string }[] } = {};
      for (const t of data) {
        const dateKey = t.date.slice(0, 10); // Always 'YYYY-MM-DD'
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push({ id: t.id, text: t.text });
      }
      setTasks(grouped);
    }, [monthStart]);

    useEffect(() => {
      fetchTasks();
    }, [fetchTasks]);

    const checkedInCount = attendance.filter(a => a.checkin_time).length;
    const totalCount = staff.length;

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="pb-5 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
                <div className="flex flex-row gap-4 my-4">
                    <StatCard
                        title="Total Employees"
                        value={staff.length}
                        icon={<UsersIcon className="h-6 w-6 text-red-600" aria-hidden="true" />}
                        position={1}
                        onClick={() => navigate('/hr/employees')}
                        style={{ cursor: 'pointer' }}
                    />
                    <StatCard
                        title="Leave Requests"
                        value={checkedInCount}
                        icon={<UsersIcon className="h-6 w-6 text-green-600" aria-hidden="true" />}
                        position={2}
                    />

                    <StatCard
                        title="Out of Office Requests"
                        value={checkedInCount}
                        icon={<UsersIcon className="h-6 w-6 text-green-600" aria-hidden="true" />}
                        position={2}
                    />

<StatCard
                        title="Documents"
                        value={checkedInCount}
                        icon={<UsersIcon className="h-6 w-6 text-green-600" aria-hidden="true" />}
                        position={2}
                        onClick={() => navigate('/documents')}
                        style={{ cursor: 'pointer' }}
                    />

                    <div className="relative">
                        <StatCard
                            title="Chat Room"
                            value={''}
                            icon={<MessageCircle className="h-6 w-6 text-blue-600" aria-hidden="true" />}
                            position={2}
                            onClick={() => navigate('/chat-room')}
                            style={{ cursor: 'pointer' }}
                        />
                        {hasNewChatMessage && (
                            <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
                        )}
                    </div>

                    <StatCard
                        title="Expiring Contracts"
                        value={expiringContracts.length}
                        icon={<AlertTriangle className="h-6 w-6 text-yellow-600" aria-hidden="true" />}
                        position={3}
                        onClick={() => navigate('/hr/employees?expiring=1')}
                        style={{ cursor: 'pointer', background: expiringContracts.length > 0 ? '#800020' : undefined }}
                    />
                    {/* Add more StatCards here if needed */}
                </div>

            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Attendance Card */}
                <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Attendance</h2>
                    <button
                        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        onClick={() => navigate('/attendance-history')}
                    >
                        View All Attendance History
                    </button>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <>
                        <div className="text-3xl font-bold text-blue-700">
                            {checkedInCount} <span className="text-gray-500 text-xl">/</span> {totalCount}
                            <div className="text-base font-normal text-gray-600 mt-2">Checked in today</div>
                        </div>
                        <div className="mt-4 w-full overflow-x-auto">
                          <table className="min-w-full text-xs border">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 py-1 text-left">Name</th>
                                <th className="px-2 py-1 text-left">Department</th>
                                <th className="px-2 py-1 text-left">Check-in</th>
                                <th className="px-2 py-1 text-left">Check-out</th>
                                <th className="px-2 py-1 text-left">Time Spent</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendance.filter(a => a.checkin_time).map(a => {
                                const checkin = a.checkin_time ? new Date(a.checkin_time) : null;
                                const checkout = a.checkout_time ? new Date(a.checkout_time) : null;
                                let timeSpent = '';
                                if (checkin) {
                                  const end = checkout || new Date();
                                  const diffMs = end.getTime() - checkin.getTime();
                                  const hours = Math.floor(diffMs / (1000 * 60 * 60));
                                  const mins = Math.floor((diffMs / (1000 * 60)) % 60);
                                  timeSpent = `${hours}h ${mins}m`;
                                }
                                return (
                                  <tr key={a.id} className="border-t">
                                    <td className="px-2 py-1">{a.name || a.staff_id}</td>
                                    <td className="px-2 py-1">{a.department || '-'}</td>
                                    <td className="px-2 py-1">{checkin ? checkin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    <td className="px-2 py-1">{checkout ? checkout.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    <td className="px-2 py-1">{timeSpent}</td>
                                  </tr>
                                );
                              })}
                              {attendance.filter(a => a.checkin_time).length === 0 && (
                                <tr><td colSpan={5} className="text-center text-gray-400 py-2">No check-ins today.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        </>
                    )}
                </div>
                {/* Calendar and Tasks */}
                <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center w-full">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Calendar & Tasks</h2>
                  {/* Calendar grid */}
                  <div className="mb-4 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-lg">{formatDate(monthStart, 'MMMM yyyy')}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
                      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                        <div key={d} className="font-semibold text-gray-700">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {calendarRows.flat().map((date, idx) => {
                        const dateStr = formatDate(date, 'yyyy-MM-dd');
                        const hasTasks = (tasks[dateStr]?.length ?? 0) > 0;
                        const isSelected = selectedDate === dateStr;
                        const isCurrentMonth = isSameMonth(date, monthStart);
                        return (
                          <button
                            key={dateStr + idx}
                            className={`rounded-full w-8 h-8 flex items-center justify-center transition
                              ${isSelected ? 'bg-blue-700 text-white' : hasTasks ? 'bg-blue-200 text-blue-900' : ''}
                              ${!isCurrentMonth ? 'opacity-40' : ''}
                              hover:bg-blue-400 hover:text-white`}
                            onClick={() => setSelectedDate(dateStr)}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Add task form */}
                  <form
                    className="flex gap-2 mb-4 w-full"
                    onSubmit={async e => {
                      e.preventDefault();
                      if (!newTask.trim()) return;
                      // Add to backend
                      const res = await fetch('/api/calendar-tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: selectedDate, text: newTask.trim() }),
                      });
                      if (res.ok) {
                        fetchTasks();
                        setNewTask('');
                      }
                    }}
                  >
                    <input
                      type="text"
                      className="border rounded px-2 py-1 flex-1"
                      placeholder="Add activity or task..."
                      value={newTask}
                      onChange={e => setNewTask(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Add
                    </button>
                  </form>
                  <div className="w-full">
                    <h3 className="text-md font-semibold mb-2">Scheduled for {formatDate(parseISO(selectedDate), 'PPP')}:</h3>
                    {(tasks[selectedDate]?.length ?? 0) === 0 ? (
                      <div className="text-gray-400 text-sm">No activities or tasks scheduled.</div>
                    ) : (
                      <ul className="list-disc pl-5">
                        {tasks[selectedDate].map(task => (
                          <li key={task.id} className="flex items-center justify-between mb-1">
                            <span>{task.text}</span>
                            <button
                              className="ml-2 text-red-500 hover:text-red-700 text-xs"
                              onClick={async () => {
                                await fetch(`/api/calendar-tasks/${task.id}`, { method: 'DELETE' });
                                fetchTasks();
                              }}
                            >
                              Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
            </div>

        </div>
    );
};

export default HrDashboardPage; 
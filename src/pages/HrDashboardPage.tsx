import React, { useEffect, useState } from 'react';
import StatCard from '../components/Dashboard/StatCard';
import { UsersIcon, AlertTriangle, MessageCircle, Clock, FileText, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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
  addMonths,
  subMonths,
} from 'date-fns';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

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
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [tasks, setTasks] = useState<{ [date: string]: { id: number; text: string }[] }>({});
    const [newTask, setNewTask] = useState('');
    const nextTaskId = useRef(1);

    // Calendar grid logic
    const monthStart = startOfMonth(currentMonth);
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
      const grouped: { [date: string]: { id: number; text: string }[] } = {};
      for (const t of data) {
        const dateKey = t.date.slice(0, 10);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push({ id: t.id, text: t.title });
      }
      setTasks(grouped);
    }, [monthStart]);

    useEffect(() => {
      fetchTasks();
    }, [fetchTasks]);

    const checkedInCount = attendance.filter(a => a.checkin_time).length;
    const totalCount = staff.length;

    const handlePrevMonth = () => {
      setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
      setCurrentMonth(addMonths(currentMonth, 1));
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-700">
                        {format(new Date(), 'EEEE, MMMM d, yyyy')}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Employees"
                    value={staff.length}
                    icon={<UsersIcon className="h-6 w-6 text-indigo-600" />}
                    position={1}
                    onClick={() => navigate('/dashboard/staff-list')}
                />
                
                <StatCard
                    title="Documents"
                    value={checkedInCount}
                    icon={<FileText className="h-6 w-6 text-blue-600" />}
                    position={3}
                    onClick={() => navigate('/document-list')}
                />
                <div className="relative">
                    <StatCard
                        title="Expiring Contracts"
                        value={expiringContracts.length}
                        icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
                        position={4}
                        onClick={() => navigate('/dashboard/expiring-contracts')}
                    />
                    {expiringContracts.length > 0 && (
                        <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
                    )}
                </div>
                <StatCard
                    title="Employee Leaves"
                    value={"View"}
                    icon={<FileText className="h-6 w-6 text-purple-600" />}
                    position={5}
                    onClick={() => navigate('/dashboard/employee-leaves')}
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attendance Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Today's Attendance</h2>
                            <div className="flex gap-2">
                              <button
                                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                  onClick={() => navigate('/attendance-history')}
                              >
                                  View All History
                              </button>
                              <button
                                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                  onClick={() => navigate('/employee-working-hours')}
                              >
                                  Employee Working Hours
                              </button>
                              <button
                                  className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                                  onClick={() => navigate('/employee-working-days')}
                              >
                                  Employee Working Days
                              </button>
                              <button
                                  className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
                                  onClick={() => navigate('/out-of-office-requests')}
                              >
                                  Out of Office Requests
                              </button>
                            </div>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6 bg-indigo-50 rounded-lg p-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Present</p>
                                        <p className="text-3xl font-bold text-indigo-700">{checkedInCount}</p>
                                    </div>
                                    <div className="h-12 w-px bg-gray-300"></div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Total Staff</p>
                                        <p className="text-3xl font-bold text-gray-700">{totalCount}</p>
                                    </div>
                                    <div className="h-12 w-px bg-gray-300"></div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Percentage</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0}%
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
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
                                                    <tr key={a.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.name || a.staff_id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.department || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {checkin ? checkin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {checkout ? checkout.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                {timeSpent}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {attendance.filter(a => a.checkin_time).length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No check-ins recorded for today.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Calendar & Tasks Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Calendar & Tasks</h2>
                            <div className="relative">
                                <button
                                    onClick={() => navigate('/chat-room')}
                                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <MessageCircle className="h-5 w-5 text-blue-600" />
                                    {hasNewChatMessage && (
                                        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500"></span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <h3 className="text-lg font-semibold text-gray-700">
                                {formatDate(currentMonth, 'MMMM yyyy')}
                            </h3>
                            <button
                                onClick={handleNextMonth}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="mb-6">
                            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
                                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                                    <div key={i} className="h-8 flex items-center justify-center">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {calendarRows.flat().map((date, idx) => {
                                    const dateStr = formatDate(date, 'yyyy-MM-dd');
                                    const hasTasks = (tasks[dateStr]?.length ?? 0) > 0;
                                    const isSelected = selectedDate === dateStr;
                                    const isCurrentMonth = isSameMonth(date, monthStart);
                                    const isToday = isSameDay(date, new Date());
                                    
                                    return (
                                        <button
                                            key={dateStr + idx}
                                            className={`relative h-10 rounded-lg flex flex-col items-center justify-center text-sm transition-colors
                                                ${isSelected ? 'bg-indigo-600 text-white' : 
                                                   hasTasks ? 'bg-indigo-100 text-indigo-900' : 
                                                   !isCurrentMonth ? 'text-gray-300' : 'hover:bg-gray-100'}
                                                ${isToday && !isSelected ? 'border border-indigo-500' : ''}`}
                                            onClick={() => setSelectedDate(dateStr)}
                                        >
                                            {date.getDate()}
                                            {hasTasks && !isSelected && (
                                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected Date Tasks */}
                        <div className="border-t pt-4">
                            <h3 className="font-medium text-gray-700 mb-3">
                                Tasks for {formatDate(parseISO(selectedDate), 'MMMM d, yyyy')}
                            </h3>
                            
                            {/* Add Task Form */}
                            <form
                                className="flex gap-2 mb-4"
                                onSubmit={async e => {
                                    e.preventDefault();
                                    if (!newTask.trim()) return;
                                    const res = await fetch('/api/calendar-tasks', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ date: selectedDate, title: newTask })
                                    });
                                    if (res.ok) {
                                        fetchTasks();
                                        setNewTask('');
                                    }
                                }}
                            >
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Add a new task..."
                                    value={newTask}
                                    onChange={e => setNewTask(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                >
                                    Add
                                </button>
                            </form>

                            {/* Tasks List */}
                            <div className="space-y-2">
                                {(tasks[selectedDate]?.length ?? 0) === 0 ? (
                                    <div className="text-center py-4 text-gray-400 text-sm">
                                        No tasks scheduled for this day.
                                    </div>
                                ) : (
                                    tasks[selectedDate].map(task => (
                                        <div key={task.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                            <span className="text-sm text-gray-700">{task.text}</span>
                                            <button
                                                className="text-red-500 hover:text-red-700 text-sm p-1"
                                                onClick={async () => {
                                                    await fetch(`/api/calendar-tasks/${task.id}`, { method: 'DELETE' });
                                                    fetchTasks();
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HrDashboardPage;
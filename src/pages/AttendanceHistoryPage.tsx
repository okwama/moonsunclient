import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AttendanceRecord {
  id: number;
  name: string;
  department: string;
  date: string;
  checkin_time: string | null;
  checkout_time: string | null;
}

interface Staff {
  id: number;
  name: string;
}

const PAGE_SIZE = 20;

const AttendanceHistoryPage: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const navigate = useNavigate();

  // Fetch staff list for filter dropdown
  useEffect(() => {
    const fetchStaff = async () => {
      const res = await fetch('/api/staff');
      const data = await res.json();
      setStaffList(data);
    };
    fetchStaff();
  }, []);

  // Fetch attendance with filters
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (staffId) params.append('staff_id', staffId);
      const res = await fetch(`/api/attendance?${params.toString()}`);
      const data = await res.json();
      setAttendance(data);
      setLoading(false);
      setPage(1); // Reset to first page on filter change
    };
    fetchAttendance();
  }, [startDate, endDate, staffId]);

  const paginated = attendance.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(attendance.length / PAGE_SIZE);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Attendance History</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Staff</label>
          <select
            className="border rounded px-2 py-1"
            value={staffId}
            onChange={e => setStaffId(e.target.value)}
          >
            <option value="">All Staff</option>
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-left">Name</th>
                <th className="px-2 py-1 text-left">Department</th>
                <th className="px-2 py-1 text-left">Date</th>
                <th className="px-2 py-1 text-left">Check-in</th>
                <th className="px-2 py-1 text-left">Check-out</th>
                <th className="px-2 py-1 text-left">Time Spent</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 py-2">No attendance records found.</td></tr>
              )}
              {paginated.map(a => {
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
                    <td className="px-2 py-1">{a.name || a.id}</td>
                    <td className="px-2 py-1">{a.department || '-'}</td>
                    <td className="px-2 py-1">{a.date ? new Date(a.date).toLocaleDateString() : '-'}</td>
                    <td className="px-2 py-1">{checkin ? checkin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-2 py-1">{checkout ? checkout.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-2 py-1">{timeSpent}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistoryPage; 
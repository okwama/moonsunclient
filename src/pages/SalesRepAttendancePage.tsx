import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { salesService, SalesRep } from '../services/salesService';
import { saveAs } from 'file-saver';

interface LoginHistory {
  id: number;
  userId: number;
  sessionStart: string; // ISO datetime
  sessionEnd?: string; // ISO datetime, optional
}

interface Leave {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  status: string | number;
}

const SalesRepAttendancePage: React.FC = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    salesService.getAllSalesReps().then(setSalesReps);
  }, []);

  useEffect(() => {
    if (!selectedRep) return;
    setLoading(true);
    Promise.all([
      axios.get('/api/login-history'),
      axios.get('/api/sales-rep-leaves/sales-rep-leaves'),
    ])
      .then(([loginRes, leavesRes]) => {
        setLoginHistory(loginRes.data.filter((l: LoginHistory) => String(l.userId) === selectedRep));
        setLeaves(leavesRes.data.filter((lv: Leave) => String(lv.userId) === selectedRep && (lv.status === 1 || lv.status === '1')));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, [selectedRep, month]);

  // Get all days in the selected month
  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const days: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, monthNum - 1, d);
    days.push(date.toISOString().slice(0, 10));
  }

  // Build attendance records
  const attendanceRecords = days.map(dateStr => {
    const dateObj = new Date(dateStr);
    // Check for leave
    const onLeave = leaves.some(lv => dateObj >= new Date(lv.startDate) && dateObj <= new Date(lv.endDate));
    // Find login(s) for the day
    const logins = loginHistory.filter(lh => lh.sessionStart && lh.sessionStart.slice(0, 10) === dateStr);
    let status = 'Absent';
    let loginTime = '';
    let logoutTime = '';
    let workingHours = '';
    if (dateObj.getDay() === 0 && onLeave) {
      status = 'Weekend (Leave)';
    } else if (dateObj.getDay() === 0) {
      status = 'Weekend';
    } else if (onLeave) {
      status = 'Leave';
    } else if (logins.length > 0) {
      status = 'Present';
      // Earliest login, latest logout
      loginTime = logins.map(lh => lh.sessionStart).sort()[0].slice(11, 16);
      if (logins.some(lh => lh.sessionEnd)) {
        logoutTime = logins.map(lh => lh.sessionEnd || '').sort().reverse()[0].slice(11, 16);
        // Calculate working hours if both present
        if (loginTime && logoutTime) {
          const inDate = new Date(`${dateStr}T${loginTime}:00`);
          const outDate = new Date(`${dateStr}T${logoutTime}:00`);
          const diffMs = outDate.getTime() - inDate.getTime();
          if (diffMs > 0) {
            const totalMinutes = Math.floor(diffMs / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            workingHours = `${hours}h ${minutes}m`;
          }
        }
      }
    }
    return { date: dateStr, status, loginTime, logoutTime, workingHours };
  });

  const totalPresent = attendanceRecords.filter(r => r.status === 'Present').length;
  const totalAbsent = attendanceRecords.filter(r => r.status === 'Absent').length;
  const totalLeave = attendanceRecords.filter(r => r.status === 'Leave' || r.status === 'Weekend (Leave)').length;
  const totalWorking = attendanceRecords.filter(r => r.status !== 'Weekend' && r.status !== 'Weekend (Leave)').length;
  const attendancePct = totalWorking - totalLeave > 0 ? ((totalPresent / (totalWorking - totalLeave)) * 100).toFixed(1) : 'N/A';

  const exportToCSV = () => {
    const dateRangeTitle = `Date Range: ${month}-01 to ${month}-${String(daysInMonth).padStart(2, '0')}`;
    const headers = [
      'Date',
      'Status',
      'Login Time',
      'Logout Time',
      'Working Hours'
    ];
    const rows = attendanceRecords.map(rec => [
      rec.date,
      rec.status,
      rec.loginTime,
      rec.logoutTime,
      rec.workingHours
    ]);
    const csvContent = [
      [dateRangeTitle],
      headers,
      ...rows
    ]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'sales_rep_attendance.csv');
  };

  return (
    <div className="w-full py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Sales Rep Attendance</h1>
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="repSelect" className="text-sm font-medium">Sales Rep:</label>
        <select
          id="repSelect"
          className="border rounded px-2 py-1"
          value={selectedRep}
          onChange={e => setSelectedRep(e.target.value)}
        >
          <option value="">Select Sales Rep</option>
          {salesReps.map(rep => (
            <option key={rep.id} value={String(rep.id)}>{rep.name}</option>
          ))}
        </select>
        <label htmlFor="monthSelect" className="text-sm font-medium">Month:</label>
        <input
          id="monthSelect"
          type="month"
          className="border rounded px-2 py-1"
          value={month}
          onChange={e => setMonth(e.target.value)}
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : selectedRep ? (
        <>
          {selectedRep && !loading && !error && (
            <div className="mb-6 flex flex-wrap gap-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
                onClick={exportToCSV}
              >
                Export to CSV
              </button>
              <div className="bg-green-100 text-green-800 rounded-lg px-6 py-4 font-bold text-lg shadow">Days Present: {totalPresent}</div>
              <div className="bg-red-100 text-red-800 rounded-lg px-6 py-4 font-bold text-lg shadow">Days Absent: {totalAbsent}</div>
              <div className="bg-yellow-100 text-yellow-800 rounded-lg px-6 py-4 font-bold text-lg shadow">Leave Days: {totalLeave}</div>
              <div className="bg-blue-100 text-blue-800 rounded-lg px-6 py-4 font-bold text-lg shadow">Attendance %: {attendancePct === 'N/A' ? 'N/A' : `${attendancePct}%`}</div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map(rec => (
                  <tr key={rec.date} className={rec.status === 'Present' ? 'bg-green-50' : rec.status === 'Leave' ? 'bg-yellow-50' : 'bg-red-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{rec.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.loginTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.logoutTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rec.workingHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-gray-600">Select a sales rep to view attendance.</div>
      )}
    </div>
  );
};

export default SalesRepAttendancePage; 
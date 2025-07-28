import React, { useEffect, useState } from 'react';

interface WorkingDaysRecord {
  id: number;
  name: string;
  department: string;
  effective_working_days: number;
  days_present: number;
  leave_days: number;
  absent_days: number;
  attendance_pct: string;
}

const EmployeeWorkingDaysPage: React.FC = () => {
  const [records, setRecords] = useState<WorkingDaysRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [staffId, setStaffId] = useState('');
  const [staffList, setStaffList] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    // Fetch staff list for filter dropdown
    fetch('/api/staff')
      .then(res => res.json())
      .then(setStaffList)
      .catch(() => setStaffList([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (staffId) params.append('staff_id', staffId);
    fetch(`/api/employee-working-days?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch working days');
        return res.json();
      })
      .then(setRecords)
      .catch(err => setError(err.message || 'Failed to fetch working days'))
      .finally(() => setLoading(false));
  }, [month, staffId]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Employee Working Days</h1>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <input
            type="month"
            className="border rounded px-2 py-1"
            value={month}
            onChange={e => setMonth(e.target.value)}
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
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-left">Name</th>
                <th className="px-2 py-1 text-left">Department</th>
                <th className="px-2 py-1 text-left">Effective Working Days</th>
                <th className="px-2 py-1 text-left">Days Present</th>
                <th className="px-2 py-1 text-left">Leave Days</th>
                <th className="px-2 py-1 text-left">Absent Days</th>
                <th className="px-2 py-1 text-left">% Attendance</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-2">No records found.</td></tr>
              )}
              {records.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-2 py-1">{r.name}</td>
                  <td className="px-2 py-1">{r.department}</td>
                  <td className="px-2 py-1">{r.effective_working_days}</td>
                  <td className="px-2 py-1">{r.days_present}</td>
                  <td className="px-2 py-1">{r.leave_days}</td>
                  <td className="px-2 py-1">{r.absent_days}</td>
                  <td className="px-2 py-1">{r.attendance_pct === 'N/A' ? 'N/A' : `${r.attendance_pct}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeWorkingDaysPage; 
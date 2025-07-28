import React, { useEffect, useState } from 'react';

interface OutOfOfficeRequest {
  id: number;
  staff_name: string;
  date: string;
  reason: string;
  comment: string;
  status: string;
}

const OutOfOfficeRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<OutOfOfficeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffId, setStaffId] = useState('');
  const [staffList, setStaffList] = useState<{ id: number; name: string }[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(setStaffList)
      .catch(() => setStaffList([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (staffId) params.append('staff_id', staffId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    fetch(`/api/out-of-office-requests?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch requests');
        return res.json();
      })
      .then(setRequests)
      .catch(err => setError(err.message || 'Failed to fetch requests'))
      .finally(() => setLoading(false));
  }, [staffId, startDate, endDate]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Out of Office Requests</h1>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
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
                <th className="px-2 py-1 text-left">Staff</th>
                <th className="px-2 py-1 text-left">Date</th>
                <th className="px-2 py-1 text-left">Reason</th>
                <th className="px-2 py-1 text-left">Comment</th>
                <th className="px-2 py-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-2">No requests found.</td></tr>
              )}
              {requests.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-2 py-1">{r.staff_name}</td>
                  <td className="px-2 py-1">{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-1">{r.reason}</td>
                  <td className="px-2 py-1">{r.comment}</td>
                  <td className="px-2 py-1">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OutOfOfficeRequestsPage; 
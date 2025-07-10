import React, { useEffect, useState } from 'react';

const EmployeeWarningsPage: React.FC = () => {
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newWarning, setNewWarning] = useState('');
  const [newStaffId, setNewStaffId] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [staff, setStaff] = useState<any[]>([]);
  const [filterStaffId, setFilterStaffId] = useState('');

  useEffect(() => {
    fetchWarnings();
    fetchStaff();
  }, []);

  const fetchWarnings = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all warnings for all employees
      const res = await fetch('/api/staff');
      if (!res.ok) throw new Error('Failed to fetch staff');
      const staffList = await res.json();
      let allWarnings: any[] = [];
      for (const emp of staffList) {
        const wRes = await fetch(`/api/staff/${emp.id}/warnings`);
        if (wRes.ok) {
          const wData = await wRes.json();
          allWarnings = allWarnings.concat(wData.map((w: any) => ({ ...w, staff_name: emp.name })));
        }
      }
      // Sort by date desc
      allWarnings.sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime());
      setWarnings(allWarnings);
    } catch (err) {
      setError('Failed to fetch warnings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      setStaff(data);
    } catch {
      setStaff([]);
    }
  };

  const handleAddWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarning.trim() || !newStaffId) return;
    setAddLoading(true);
    setAddError('');
    try {
      const res = await fetch(`/api/staff/${newStaffId}/warnings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newWarning }),
      });
      if (!res.ok) throw new Error('Failed to post warning');
      setNewWarning('');
      setNewStaffId('');
      setShowAdd(false);
      fetchWarnings();
    } catch (err) {
      setAddError('Failed to post warning.');
    } finally {
      setAddLoading(false);
    }
  };

  const filteredWarnings = filterStaffId
    ? warnings.filter(w => String(w.staff_id) === filterStaffId)
    : warnings;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Employee Warnings</h1>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => setShowAdd(v => !v)}
        >
          {showAdd ? 'Cancel' : 'Add Warning'}
        </button>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium">Filter by Employee:</label>
        <select
          value={filterStaffId}
          onChange={e => setFilterStaffId(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Employees</option>
          {staff.map((emp: any) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>
      {showAdd && (
        <form onSubmit={handleAddWarning} className="mb-6 flex flex-col gap-2 bg-gray-50 p-4 rounded">
          <select
            value={newStaffId}
            onChange={e => setNewStaffId(e.target.value)}
            className="border rounded px-2 py-1"
            required
          >
            <option value="">Select Employee</option>
            {staff.map((emp: any) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <textarea
            value={newWarning}
            onChange={e => setNewWarning(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Enter warning message..."
            rows={2}
            required
          />
          <button type="submit" className="bg-red-600 text-white px-3 py-1 rounded self-end" disabled={addLoading || !newWarning.trim() || !newStaffId}>
            {addLoading ? 'Posting...' : 'Post Warning'}
          </button>
          {addError && <p className="text-red-600 text-xs mt-1">{addError}</p>}
        </form>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 text-left">Employee</th>
              <th className="px-2 py-1 text-left">Warning</th>
              <th className="px-2 py-1 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredWarnings.map(w => (
              <tr key={w.id} className="border-t">
                <td className="px-2 py-1">{w.staff_name || w.staff_id}</td>
                <td className="px-2 py-1">{w.message}</td>
                <td className="px-2 py-1">{w.issued_at && new Date(w.issued_at).toLocaleString()}</td>
              </tr>
            ))}
            {filteredWarnings.length === 0 && (
              <tr><td colSpan={3} className="text-center text-gray-400 py-2">No warnings found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeWarningsPage; 
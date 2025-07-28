import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { salesService, SalesRep } from '../services/salesService';
import { saveAs } from 'file-saver';

interface Leave {
  id: number;
  userId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachment?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const SalesRepLeavesPage: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('0');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [pendingStatusFilter, setPendingStatusFilter] = useState(statusFilter);
  const [pendingStartDate, setPendingStartDate] = useState(startDateFilter);
  const [pendingEndDate, setPendingEndDate] = useState(endDateFilter);
  const [pendingSelectedRep, setPendingSelectedRep] = useState(selectedRep);

  useEffect(() => {
    salesService.getAllSalesReps().then(setSalesReps);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get('/api/sales-rep-leaves/sales-rep-leaves')
      .then(res => setLeaves(res.data))
      .catch(err => setError(err.message || 'Failed to fetch leaves'))
      .finally(() => setLoading(false));
  }, []);

  const filteredLeaves = leaves.filter(leave => {
    const statusMatch = !statusFilter || String(leave.status) === statusFilter;
    let dateMatch = true;
    if (startDateFilter) {
      dateMatch = dateMatch && new Date(leave.startDate) >= new Date(startDateFilter);
    }
    if (endDateFilter) {
      dateMatch = dateMatch && new Date(leave.endDate) <= new Date(endDateFilter);
    }
    const repMatch = !selectedRep || String(leave.userId) === selectedRep;
    return statusMatch && dateMatch && repMatch;
  });

  const handleUpdateStatus = async (leaveId: number, newStatus: number) => {
    try {
      await axios.patch(`/api/sales-rep-leaves/sales-rep-leaves/${leaveId}/status`, { status: newStatus });
      setLeaves((prev) => prev.map(l => l.id === leaveId ? { ...l, status: String(newStatus) } : l));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const openFilterModal = () => {
    setPendingStatusFilter(statusFilter);
    setPendingStartDate(startDateFilter);
    setPendingEndDate(endDateFilter);
    setPendingSelectedRep(selectedRep);
    setFilterModalOpen(true);
  };
  const applyFilters = () => {
    setStatusFilter(pendingStatusFilter);
    setStartDateFilter(pendingStartDate);
    setEndDateFilter(pendingEndDate);
    setSelectedRep(pendingSelectedRep);
    setFilterModalOpen(false);
  };
  const clearFilters = () => {
    setPendingStatusFilter('0');
    setPendingStartDate('');
    setPendingEndDate('');
    setPendingSelectedRep('');
  };

  const exportToCSV = () => {
    const headers = [
      'Sales Rep',
      'Leave Type',
      'Start Date',
      'End Date',
      'Reason',
      'Attachment',
      'Status'
    ];
    const rows = filteredLeaves.map(leave => [
      (salesReps.find(rep => String(rep.id) === String(leave.userId))?.name) || '',
      leave.leaveType,
      leave.startDate,
      leave.endDate,
      leave.reason,
      leave.attachment || '',
      String(leave.status) === '1' ? 'Approved' : String(leave.status) === '3' ? 'Declined' : 'Pending'
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'sales_rep_leaves.csv');
  };

  return (
    <div className="w-full py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales Rep Leaves</h1>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <button
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-200"
          onClick={openFilterModal}
        >
          Filter
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
          onClick={exportToCSV}
        >
          Export to CSV
        </button>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading leaves...</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-x-auto w-full">
          <table className="min-w-full w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Rep</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-xs">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeaves.map(leave => {
                const rep = salesReps.find(r => r.id === leave.userId);
                return (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{rep ? rep.name : leave.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{leave.leaveType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td
                      className="px-6 py-4 whitespace-nowrap max-w-xs truncate cursor-pointer text-blue-600 hover:underline"
                      onClick={() => {
                        setSelectedReason(leave.reason);
                        setReasonModalOpen(true);
                      }}
                      title={leave.reason}
                    >
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {leave.attachment ? (
                        <a href={leave.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      {String(leave.status) !== '1' && (
                        <>
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs"
                            onClick={() => handleUpdateStatus(leave.id, 1)}
                          >
                            Approve
                          </button>
                          {String(leave.status) !== '3' && (
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                              onClick={() => handleUpdateStatus(leave.id, 3)}
                            >
                              Decline
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No leaves found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Filter Leaves</h2>
            <div className="mb-4 flex flex-col gap-4">
              <div>
                <label htmlFor="statusFilter" className="text-sm font-medium">Status:</label>
                <select
                  id="statusFilter"
                  className="border rounded px-2 py-1 w-full"
                  value={pendingStatusFilter}
                  onChange={e => setPendingStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="1">Approved</option>
                  <option value="3">Declined</option>
                  <option value="0">Pending</option>
                </select>
              </div>
              <div>
                <label htmlFor="startDate" className="text-sm font-medium">Start Date:</label>
                <input
                  id="startDate"
                  type="date"
                  className="border rounded px-2 py-1 w-full"
                  value={pendingStartDate}
                  onChange={e => setPendingStartDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="text-sm font-medium">End Date:</label>
                <input
                  id="endDate"
                  type="date"
                  className="border rounded px-2 py-1 w-full"
                  value={pendingEndDate}
                  onChange={e => setPendingEndDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="repFilter" className="text-sm font-medium">Sales Rep:</label>
                <select
                  id="repFilter"
                  className="border rounded px-2 py-1 w-full"
                  value={pendingSelectedRep}
                  onChange={e => setPendingSelectedRep(e.target.value)}
                >
                  <option value="">All</option>
                  {salesReps.map(rep => (
                    <option key={rep.id} value={String(rep.id)}>
                      {rep.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                onClick={clearFilters}
              >
                Clear
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={applyFilters}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      {reasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4">Full Reason</h2>
            <div className="mb-6 text-gray-800 whitespace-pre-line">{selectedReason}</div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setReasonModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesRepLeavesPage; 
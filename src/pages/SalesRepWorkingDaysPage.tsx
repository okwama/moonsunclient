import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { salesService, SalesRep, Country } from '../services/salesService';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';

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

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const SalesRepWorkingDaysPage: React.FC = () => {
  // Use current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month, daysInMonth);

  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date(year, month, 1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date(year, month + 1, 0);
    return d.toISOString().slice(0, 10);
  });

  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [pendingCountry, setPendingCountry] = useState(selectedCountry);
  const [pendingRep, setPendingRep] = useState(selectedRep);
  const [pendingStartDate, setPendingStartDate] = useState(startDate);
  const [pendingEndDate, setPendingEndDate] = useState(endDate);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      salesService.getAllSalesReps(),
      axios.get('/api/login-history'),
      axios.get('/api/sales-rep-leaves/sales-rep-leaves'),
      salesService.getCountries(),
    ])
      .then(([repsRes, loginRes, leavesRes, countriesRes]) => {
        setSalesReps(repsRes);
        setLoginHistory(loginRes.data);
        setLeaves(leavesRes.data);
        setCountries(countriesRes);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      salesService.getAllSalesReps(),
      axios.get('/api/login-history'),
      axios.get('/api/sales-rep-leaves/sales-rep-leaves'),
    ])
      .then(([repsRes, loginRes, leavesRes]) => {
        setSalesReps(repsRes);
        setLoginHistory(loginRes.data);
        setLeaves(leavesRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, [selectedCountry]); // Re-run when country changes

  // Helper: get all working days in range as string yyyy-mm-dd, excluding Sundays
  const getWorkingDaysInRange = () => {
    const days: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0) {
        days.push(d.toISOString().slice(0, 10));
      }
    }
    return days;
  };
  const workingDays = getWorkingDaysInRange();
  const numWorkingDays = workingDays.length;
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);

  const filteredSalesReps = selectedCountry
    ? salesReps.filter(rep => rep.country === selectedCountry)
    : salesReps;

  // Calculate stats for each sales rep
  const repStats = filteredSalesReps.map(rep => {
    // Days present: unique loginAt dates in range (excluding Sundays)
    const presentDays = new Set(
      loginHistory
        .filter(lh => lh.userId === rep.id &&
          lh.sessionStart &&
          new Date(lh.sessionStart) >= rangeStart && new Date(lh.sessionStart) <= rangeEnd &&
          new Date(lh.sessionStart).getDay() !== 0)
        .map(lh => lh.sessionStart.slice(0, 10))
    );
    // Leave days: sum of working days in range covered by approved leaves
    const repLeaves = leaves.filter(lv => String(lv.userId) === String(rep.id) && (lv.status === 1 || lv.status === '1'));
    let leaveDays = 0;
    repLeaves.forEach(lv => {
      const leaveStart = new Date(lv.startDate) < rangeStart ? rangeStart : new Date(lv.startDate);
      const leaveEnd = new Date(lv.endDate) > rangeEnd ? rangeEnd : new Date(lv.endDate);
      for (let d = new Date(leaveStart); d <= leaveEnd; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0 && d >= rangeStart && d <= rangeEnd) {
          leaveDays++;
        }
      }
    });
    // Days absent: total working days - present - leave
    const daysAbsent = numWorkingDays - presentDays.size - leaveDays;
    const denominator = numWorkingDays - leaveDays;
    const attendance = denominator > 0 ? ((presentDays.size / denominator) * 100).toFixed(1) : 'N/A';
    return {
      rep,
      present: presentDays.size,
      leave: leaveDays,
      absent: daysAbsent < 0 ? 0 : daysAbsent,
      attendance,
    };
  });

  const sortedRepStats = [...repStats].sort((a, b) => {
    if (a.attendance === 'N/A' && b.attendance === 'N/A') return 0;
    if (a.attendance === 'N/A') return 1;
    if (b.attendance === 'N/A') return -1;
    return parseFloat(b.attendance) - parseFloat(a.attendance);
  });

  const filteredRepStats = selectedRep
    ? sortedRepStats.filter(stat => String(stat.rep.id) === selectedRep)
    : sortedRepStats;

  const exportToCSV = () => {
    const dateRangeTitle = `Date Range: ${startDate} to ${endDate}`;
    const headers = [
      'Sales Rep',
      'Days Present',
      'Days Absent',
      'Leave Days',
      '% Attendance'
    ];
    const rows = filteredRepStats.map(stat => [
      stat.rep.name,
      stat.present,
      stat.absent,
      stat.leave,
      stat.attendance === 'N/A' ? 'N/A' : `${stat.attendance}%`
    ]);
    const csvContent = [
      [dateRangeTitle],
      headers,
      ...rows
    ]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'sales_rep_working_days.csv');
  };

  const openFilterModal = () => {
    setPendingCountry(selectedCountry);
    setPendingRep(selectedRep);
    setPendingStartDate(startDate);
    setPendingEndDate(endDate);
    setFilterModalOpen(true);
  };
  const applyFilters = () => {
    setSelectedCountry(pendingCountry);
    setSelectedRep(pendingRep);
    setStartDate(pendingStartDate);
    setEndDate(pendingEndDate);
    setFilterModalOpen(false);
  };
  const clearFilters = () => {
    setPendingCountry('');
    setPendingRep('');
    setPendingStartDate(() => {
      const d = new Date(year, month, 1);
      return d.toISOString().slice(0, 10);
    });
    setPendingEndDate(() => {
      const d = new Date(year, month + 1, 0);
      return d.toISOString().slice(0, 10);
    });
  };

  return (
    <div className="w-full py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Sales Rep Working Days ({now.toLocaleString('default', { month: 'long', year: 'numeric' })})</h1>
      <div className="mb-4 flex items-center gap-4">
        <Link
          to="/sales-rep-attendance"
          className="bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded shadow hover:bg-blue-200"
        >
          Sales Rep Attendance
        </Link>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
          onClick={exportToCSV}
        >
          Export to CSV
        </button>
        <button
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-200"
          onClick={openFilterModal}
        >
          Filter
        </button>
      </div>
      <div className="mb-4 text-lg font-semibold text-gray-700">
        Working days in {now.toLocaleString('default', { month: 'long', year: 'numeric' })}: {numWorkingDays}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Rep</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepStats.map(stat => {
                let cellClass = '';
                if (stat.attendance === 'N/A') {
                  cellClass = 'bg-gray-100';
                } else {
                  const att = parseFloat(stat.attendance);
                  if (att >= 90) cellClass = 'bg-green-100';
                  else if (att >= 75) cellClass = 'bg-yellow-100';
                  else cellClass = 'bg-red-100';
                }
                return (
                  <tr key={stat.rep.id} className="hover:bg-gray-50">
                    <td className={`px-6 py-4 whitespace-nowrap ${cellClass}`}>{stat.rep.name}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${cellClass}`}>{stat.present}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${cellClass}`}>{stat.absent}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${cellClass}`}>{stat.leave}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${cellClass}`}>{stat.attendance === 'N/A' ? 'N/A' : `${stat.attendance}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Filter Working Days</h2>
            <div className="mb-4 flex flex-col gap-4">
              <div>
                <label htmlFor="countryFilter" className="text-sm font-medium">Country:</label>
                <select
                  id="countryFilter"
                  className="border rounded px-2 py-1 w-full"
                  value={pendingCountry}
                  onChange={e => setPendingCountry(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="repFilter" className="text-sm font-medium">Sales Rep:</label>
                <select
                  id="repFilter"
                  className="border rounded px-2 py-1 w-full"
                  value={pendingRep}
                  onChange={e => setPendingRep(e.target.value)}
                >
                  <option value="">All Sales Reps</option>
                  {filteredSalesReps.map(rep => (
                    <option key={rep.id} value={String(rep.id)}>{rep.name}</option>
                  ))}
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
                  max={pendingEndDate}
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
                  min={pendingStartDate}
                />
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
    </div>
  );
};

export default SalesRepWorkingDaysPage; 
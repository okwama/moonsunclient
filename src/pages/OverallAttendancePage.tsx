import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { salesService, Country, SalesRep } from '../services/salesService';

interface LoginHistory {
  id: number;
  userId: number;
  sessionStart: string;
}

interface JourneyPlan {
  id: number;
  userId: number;
  clientId: number;
  date: string; // yyyy-mm-dd
}

interface Client {
  id: number;
  name: string;
}

interface AttendanceRow {
  date: string;
  clientsVisited: number;
  activeSalesReps: number;
}

const OverallAttendancePage: React.FC = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const defaultStart = new Date(year, month, 1).toISOString().slice(0, 10);
  const defaultEnd = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [journeyPlans, setJourneyPlans] = useState<JourneyPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [pendingCountry, setPendingCountry] = useState('');
  const [pendingStartDate, setPendingStartDate] = useState(defaultStart);
  const [pendingEndDate, setPendingEndDate] = useState(defaultEnd);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/login-history'),
      axios.get('/api/journey-plans'),
      axios.get('/api/clients'),
      salesService.getCountries(),
      salesService.getAllSalesReps(),
    ])
      .then(([loginRes, journeyRes, clientsRes, countriesRes, salesRepsRes]) => {
        setLoginHistory(loginRes.data);
        setJourneyPlans(journeyRes.data);
        setClients(clientsRes.data);
        setCountries(countriesRes);
        setSalesReps(salesRepsRes);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Group loginHistory by date
    const dateMap: Record<string, { salesReps: Set<number>; clients: Set<number> }> = {};
    loginHistory.forEach(lh => {
      if (!lh.sessionStart) return;
      const date = lh.sessionStart.slice(0, 10);
      if (!dateMap[date]) dateMap[date] = { salesReps: new Set(), clients: new Set() };
      dateMap[date].salesReps.add(lh.userId);
    });
    // Group journeyPlans by date and add clients
    journeyPlans.forEach(jp => {
      const date = jp.date.slice(0, 10);
      if (!dateMap[date]) dateMap[date] = { salesReps: new Set(), clients: new Set() };
      dateMap[date].clients.add(jp.clientId);
    });
    // Build rows
    const rows: AttendanceRow[] = Object.entries(dateMap)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, { salesReps, clients }]) => ({
        date,
        clientsVisited: clients.size,
        activeSalesReps: salesReps.size,
      }));
    setAttendanceRows(rows);
  }, [loginHistory, journeyPlans]);

  const filteredRows = attendanceRows.filter(row => {
    if (startDate && row.date < startDate) return false;
    if (endDate && row.date > endDate) return false;
    if (selectedCountry) {
      // Find all sales reps in this country
      const repIds = salesReps.filter(rep => rep.country === selectedCountry).map(rep => rep.id);
      // Only include rows where at least one active sales rep is from this country
      // (Assume active sales reps are those in LoginHistory for that date)
      const loginReps = loginHistory.filter(lh => lh.sessionStart && lh.sessionStart.slice(0, 10) === row.date).map(lh => lh.userId);
      if (!loginReps.some(id => repIds.includes(id))) return false;
    }
    return true;
  });

  const openFilterModal = () => {
    setPendingCountry(selectedCountry);
    setPendingStartDate(startDate);
    setPendingEndDate(endDate);
    setFilterModalOpen(true);
  };
  const applyFilters = () => {
    setSelectedCountry(pendingCountry);
    setStartDate(pendingStartDate);
    setEndDate(pendingEndDate);
    setFilterModalOpen(false);
  };
  const clearFilters = () => {
    setPendingCountry('');
    setPendingStartDate(defaultStart);
    setPendingEndDate(defaultEnd);
  };

  return (
    <div className="w-full py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Overall Attendance</h1>
      <div className="mb-4 flex items-center gap-4">
        <button
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-200"
          onClick={openFilterModal}
        >
          Filter
        </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clients Visited</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Sales Reps</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(row => (
                <tr key={row.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.clientsVisited}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.activeSalesReps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Filter Attendance</h2>
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

export default OverallAttendancePage; 
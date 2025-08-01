import React, { useState, useEffect } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SalesRepData {
  id: number;
  name: string;
  total_journeys: number;
  completion_rate: number;
}

const SalesRepMasterReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [salesReps, setSalesReps] = useState<SalesRepData[]>([]);
  const [filteredData, setFilteredData] = useState<SalesRepData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showJourneyDetailsModal, setShowJourneyDetailsModal] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState<SalesRepData | null>(null);
  const [journeyDetails, setJourneyDetails] = useState<any[]>([]);
  const [loadingJourneyDetails, setLoadingJourneyDetails] = useState(false);
  

  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  useEffect(() => {
    fetchSalesRepData();
  }, [selectedYear, selectedMonth, selectedDate]);

  useEffect(() => {
    filterData();
    setCurrentPage(1);
  }, [salesReps, searchQuery]);

  const fetchSalesRepData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth }),
        date: selectedDate
      });

      const response = await fetch(`/api/sales/rep/master-report?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales rep data');
      }
      
      const data = await response.json();
      console.log('Received sales rep data:', data);
      setSalesReps(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales rep data');
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneyDetails = async (salesRepId: number) => {
    try {
      setLoadingJourneyDetails(true);
      
      const params = new URLSearchParams({
        salesRepId: salesRepId.toString(),
        date: selectedDate
      });

      const response = await fetch(`/api/sales/rep/journey-details?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch journey details');
      }
      
      const data = await response.json();
      setJourneyDetails(data);
    } catch (err: any) {
      console.error('Error fetching journey details:', err);
      setJourneyDetails([]);
    } finally {
      setLoadingJourneyDetails(false);
    }
  };



  const handleSalesRepClick = async (salesRep: SalesRepData) => {
    setSelectedSalesRep(salesRep);
    setShowJourneyDetailsModal(true);
    await fetchJourneyDetails(salesRep.id);
  };

  const handleViewReports = (journey: any) => {
    navigate(`/sales-rep-reports/${selectedSalesRep!.id}/${journey.client_id}?date=${selectedDate}`);
  };

  const filterData = () => {
    if (!searchQuery.trim()) {
      setFilteredData(salesReps);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = salesReps.filter(rep =>
      rep.name.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const exportToCSV = async () => {
    if (exporting) return;
    
    try {
      setExporting(true);
      
      const headers = ['Sales Rep Name', 'Total Journeys', 'Completion Rate (%)'];
      
      const csvData = filteredData.map(rep => [
        rep.name,
        rep.total_journeys,
        Number(rep.completion_rate).toFixed(1)
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filterInfo = [];
      if (selectedYear !== new Date().getFullYear()) filterInfo.push(`Year-${selectedYear}`);
      if (selectedMonth) filterInfo.push(`Month-${months.find(m => m.value === selectedMonth)?.label}`);
      if (selectedDate !== new Date().toISOString().split('T')[0]) filterInfo.push(`Date-${selectedDate}`);
      
      const filterSuffix = filterInfo.length > 0 ? `-${filterInfo.join('-')}` : '';
      a.download = `sales-rep-master-report-${selectedYear}-${dateStr}${filterSuffix}.csv`;
      
      a.click();
      window.URL.revokeObjectURL(url);
      
      console.log('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales rep data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
          <button
            onClick={fetchSalesRepData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Sales Rep Master Report</h1>
          <p className="mt-2 text-sm text-gray-700">
            Sales representatives and their visited outlets performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-2">
          <button
            onClick={exportToCSV}
            disabled={exporting || filteredData.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search and Filter Button */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Search sales reps by name..."
            />
          </div>
        </div>
        <div className="sm:w-48">
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(() => {
              const activeFilters = [
                selectedYear !== new Date().getFullYear(),
                selectedMonth,
                selectedDate !== new Date().toISOString().split('T')[0]
              ].filter(Boolean).length;
              return activeFilters > 0 ? ` (${activeFilters})` : '';
            })()}
          </button>
        </div>
      </div>

      {/* Sales Rep Table */}
      <div className="mt-8">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Sales Rep Name
                    </th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                      Total Journeys
                    </th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                      Completion Rate
                    </th>
                    <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                        No sales rep data found
                      </td>
                    </tr>
                  ) : (
                    currentData.map((rep) => (
                      <tr key={rep.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {rep.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                          {rep.total_journeys}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                          <span className={`font-medium ${Number(rep.completion_rate) >= 80 ? 'text-green-600' : Number(rep.completion_rate) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {Number(rep.completion_rate).toFixed(1)}%
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <button
                            onClick={() => handleSalesRepClick(rep)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {/* Summary Row */}
                {currentData.length > 0 && (
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-3 py-4 text-sm font-semibold text-gray-900">
                        Total
                      </td>
                      <td className="px-3 py-4 text-sm font-semibold text-right text-gray-900">
                        {filteredData.reduce((sum, rep) => sum + rep.total_journeys, 0)}
                      </td>
                      <td className="px-3 py-4 text-sm font-semibold text-right text-gray-900">
                        {filteredData.length > 0 ? (filteredData.reduce((sum, rep) => sum + Number(rep.completion_rate), 0) / filteredData.length).toFixed(1) : 0}%
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        -
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Items per page and info */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
            </div>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                    page === currentPage
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowFilterModal(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-bold mb-4">Filter Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Year */}
              <div>
                <h3 className="text-md font-semibold mb-3">Year</h3>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <h3 className="text-md font-semibold mb-3">Month</h3>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <h3 className="text-md font-semibold mb-3">Date</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Select Date"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6 gap-2">
              <button
                onClick={() => {
                  setSelectedYear(new Date().getFullYear());
                  setSelectedMonth('');
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                }}
                className="px-4 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
              >
                Reset to Today
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journey Details Modal */}
      {showJourneyDetailsModal && selectedSalesRep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowJourneyDetailsModal(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Journey Details - {selectedSalesRep.name}
              </h2>
              <p className="text-sm text-gray-600">
                Date: {selectedDate} | Total Journeys: {selectedSalesRep.total_journeys} | Completion Rate: {Number(selectedSalesRep.completion_rate).toFixed(1)}%
              </p>
            </div>

            {loadingJourneyDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-2 text-gray-600">Loading journey details...</span>
              </div>
            ) : journeyDetails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No journey details found for this sales rep on the selected date.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Outlet
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Check In Time
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Check Out Time
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {journeyDetails.map((journey) => (
                      <tr key={journey.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {journey.outlet_name || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {journey.checkInTime ? new Date(journey.checkInTime).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {journey.checkOutTime ? new Date(journey.checkOutTime).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            journey.status === 'completed' ? 'bg-green-100 text-green-800' :
                            journey.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            journey.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {journey.status || 'N/A'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <button
                            onClick={() => handleViewReports(journey)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Reports
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default SalesRepMasterReportPage; 
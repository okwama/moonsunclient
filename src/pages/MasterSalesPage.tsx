import React, { useState, useEffect } from 'react';
import { clientService } from '../services/clientService';
import { salesService, MasterSalesData } from '../services/salesService';
import { Search, Download, Filter } from 'lucide-react';

const MasterSalesPage: React.FC = () => {
  const [salesData, setSalesData] = useState<MasterSalesData[]>([]);
  const [filteredData, setFilteredData] = useState<MasterSalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedSalesReps, setSelectedSalesReps] = useState<number[]>([]);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [clientStatus, setClientStatus] = useState<string>('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [salesReps, setSalesReps] = useState<{ id: number; name: string }[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    fetchSalesData();
  }, [selectedYear, selectedCategories, selectedSalesReps, selectedCategoryGroup, startDate, endDate, clientStatus]);

  useEffect(() => {
    fetchCategories();
    fetchSalesReps();
  }, []);

  useEffect(() => {
    filterData();
    setCurrentPage(1); // Reset to first page when data changes
  }, [salesData, searchQuery]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoryIds = selectedCategories.length > 0 ? selectedCategories : undefined;
      const salesRepIds = selectedSalesReps.length > 0 ? selectedSalesReps : undefined;
      const categoryGroup = selectedCategoryGroup || undefined;
      const startDateParam = startDate || undefined;
      const endDateParam = endDate || undefined;
      const clientStatusParam = clientStatus || undefined;
      const data = await salesService.getMasterSalesData(selectedYear, categoryIds, salesRepIds, categoryGroup, startDateParam, endDateParam, clientStatusParam);
      setSalesData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await salesService.getMasterSalesCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchSalesReps = async () => {
    try {
      const data = await salesService.getMasterSalesSalesReps();
      setSalesReps(data);
    } catch (err: any) {
      console.error('Failed to fetch sales reps:', err);
    }
  };

  const filterData = () => {
    if (!searchQuery.trim()) {
      setFilteredData(salesData);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = salesData.filter(client =>
      client.client_name.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const exportToCSV = async () => {
    if (exporting) return;
    
    try {
      setExporting(true);
      
      // Create headers with proper formatting
      const headers = ['Client Name', ...monthLabels.map(m => m), 'Total'];
      
      // Create CSV data with proper number formatting
      const csvData = filteredData.map(client => [
        client.client_name,
        ...months.map(month => formatCurrency((client as any)[month] || 0)),
        formatCurrency(client.total)
      ]);

      // Add summary row
      const summaryRow = ['TOTAL', ...months.map(month => {
        const total = filteredData.reduce((sum, client) => sum + ((client as any)[month] || 0), 0);
        return formatCurrency(total);
      }), formatCurrency(filteredData.reduce((sum, client) => sum + client.total, 0))];

      // Combine headers, data, and summary
      const csvContent = [headers, ...csvData, summaryRow]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Create filename with current date and filters info
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filterInfo = [];
      if (selectedYear !== new Date().getFullYear()) filterInfo.push(`Year-${selectedYear}`);
      if (startDate) filterInfo.push(`From-${startDate}`);
      if (endDate) filterInfo.push(`To-${endDate}`);
      if (selectedCategoryGroup) filterInfo.push(selectedCategoryGroup);
      if (clientStatus) filterInfo.push(clientStatus);
      if (selectedCategories.length > 0) filterInfo.push(`${selectedCategories.length}-SKUs`);
      if (selectedSalesReps.length > 0) filterInfo.push(`${selectedSalesReps.length}-SalesReps`);
      
      const filterSuffix = filterInfo.length > 0 ? `-${filterInfo.join('-')}` : '';
      a.download = `master-sales-${selectedYear}-${dateStr}${filterSuffix}.csv`;
      
      a.click();
      window.URL.revokeObjectURL(url);
      
      // Show success message (optional - you can add a toast notification here)
      console.log('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
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
          <p className="mt-4 text-gray-600">Loading sales data...</p>
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
            onClick={fetchSalesData}
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
          <h1 className="text-xl font-semibold text-gray-900">Master Sales Report</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monthly sales values for all clients
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
              placeholder="Search clients..."
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
                startDate,
                endDate,
                selectedCategories.length > 0,
                selectedSalesReps.length > 0,
                selectedCategoryGroup,
                clientStatus
              ].filter(Boolean).length;
              return activeFilters > 0 ? ` (${activeFilters})` : '';
            })()}
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="mt-8">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                      Client Name
                    </th>
                    {monthLabels.map((month, index) => (
                      <th key={month} className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                        {month}
                      </th>
                    ))}
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 bg-gray-100">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-3 py-4 text-center text-sm text-gray-500">
                        No sales data found
                      </td>
                    </tr>
                  ) : (
                    currentData.map((client) => (
                      <tr key={client.client_id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                          {client.client_name}
                        </td>
                        {months.map((month) => (
                          <td key={month} className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                            {formatCurrency((client as any)[month] || 0)}
                          </td>
                        ))}
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-right text-gray-900 bg-gray-50">
                          {formatCurrency(client.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {/* Summary Row */}
                {filteredData.length > 0 && (
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-3 py-4 text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                        Total
                      </td>
                      {months.map((month) => {
                        const monthTotal = filteredData.reduce((sum, client) => 
                          sum + ((client as any)[month] || 0), 0
                        );
                        return (
                          <td key={month} className="px-3 py-4 text-sm font-semibold text-right text-gray-900">
                            {formatCurrency(monthTotal)}
                          </td>
                        );
                      })}
                      <td className="px-3 py-4 text-sm font-bold text-right text-gray-900 bg-gray-100">
                        {formatCurrency(filteredData.reduce((sum, client) => sum + client.total, 0))}
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowFilterModal(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-bold mb-4">Filter Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {/* Date Range */}
              <div>
                <h3 className="text-md font-semibold mb-3">Date Range</h3>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="End Date"
                  />
                </div>
              </div>

              {/* Category Group */}
              <div>
                <h3 className="text-md font-semibold mb-3">Category Group</h3>
                <select
                  value={selectedCategoryGroup}
                  onChange={(e) => setSelectedCategoryGroup(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="vapes">Vapes</option>
                  <option value="pouches">Pouches</option>
                </select>
              </div>

              {/* Client Status */}
              <div>
                <h3 className="text-md font-semibold mb-3">Client Status</h3>
                <select
                  value={clientStatus}
                  onChange={(e) => setClientStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="">All Clients</option>
                  <option value="active">Active Clients</option>
                  <option value="inactive">Inactive Clients</option>
                </select>
              </div>

              {/* SKUs */}
              <div>
                <h3 className="text-md font-semibold mb-3">SKUs</h3>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-3">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                        }}
                        className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-sm text-red-600 hover:text-red-800 mt-2"
                >
                  Clear All
                </button>
              </div>

              {/* Sales Reps */}
              <div>
                <h3 className="text-md font-semibold mb-3">Sales Representatives</h3>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-3">
                  {salesReps.map(salesRep => (
                    <label key={salesRep.id} className="flex items-center mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSalesReps.includes(salesRep.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSalesReps([...selectedSalesReps, salesRep.id]);
                          } else {
                            setSelectedSalesReps(selectedSalesReps.filter(id => id !== salesRep.id));
                          }
                        }}
                        className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">{salesRep.name}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedSalesReps([])}
                  className="text-sm text-red-600 hover:text-red-800 mt-2"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-6 gap-2">
              <button
                onClick={() => {
                  setSelectedYear(new Date().getFullYear());
                  setStartDate('');
                  setEndDate('');
                  setSelectedCategoryGroup('');
                  setClientStatus('');
                  setSelectedCategories([]);
                  setSelectedSalesReps([]);
                }}
                className="px-4 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
              >
                Clear All Filters
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
    </div>
  );
};

export default MasterSalesPage; 
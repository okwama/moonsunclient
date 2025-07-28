import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  availabilityReportService, 
  AvailabilityReport, 
  AvailabilityReportFilters 
} from '../services/availabilityReportService';

const AvailabilityReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<AvailabilityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AvailabilityReportFilters>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [salesReps, setSalesReps] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchReports();
    fetchFilterData();
  }, [filters, page, limit, search]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await availabilityReportService.getAvailabilityReports(
        filters,
        page,
        limit,
        search
      );
      setReports(response.reports);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch availability reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterData = async () => {
    try {
      const [countriesData, salesRepsData] = await Promise.all([
        availabilityReportService.getAvailabilityCountries(),
        availabilityReportService.getAvailabilitySalesReps()
      ]);
      setCountries(countriesData);
      setSalesReps(salesRepsData);
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  };

  const handleFilterChange = (key: keyof AvailabilityReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleExport = async () => {
    try {
      const blob = await availabilityReportService.exportAvailabilityReports(filters, search);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `availability-reports-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export reports');
      console.error('Error exporting reports:', err);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Group reports by client (outlet)
  const getGroupedReports = () => {
    const grouped = reports.reduce((acc, report) => {
      if (!acc[report.clientId]) {
        acc[report.clientId] = {
          clientId: report.clientId,
          clientName: report.clientName,
          countryName: report.countryName,
          salesRepName: report.salesRepName,
          latestDate: report.createdAt,
          products: []
        };
      }
      acc[report.clientId].products.push({
        productName: report.productName,
        quantity: report.quantity,
        comment: report.comment,
        createdAt: report.createdAt
      });
      // Update latest date if this report is newer
      if (new Date(report.createdAt) > new Date(acc[report.clientId].latestDate)) {
        acc[report.clientId].latestDate = report.createdAt;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  };

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Availability Reports</h1>
              <p className="text-gray-600 mt-2">Track product availability across all outlets</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/visibility-report')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Visibility Reports
              </button>
              <button
                onClick={() => navigate('/feedback-reports')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Feedback Reports
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by outlet, comment, country, or sales rep..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Filters
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(Object.values(filters).some(v => v) || search) && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => 
                value && (
                  <span
                    key={key}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {key}: {value}
                  </span>
                )
              )}
              {search && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  search: {search}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-red-600 text-xs hover:text-red-800"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outlet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Rep
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getGroupedReports().map((group) => (
                  <React.Fragment key={group.clientId}>
                    {group.products.map((product: any, index: number) => (
                      <tr key={`${group.clientId}-${product.productName}`} 
                          className={index === 0 ? 'border-t-2 border-gray-300' : ''}>
                        {index === 0 ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" rowSpan={group.products.length}>
                              {group.clientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" rowSpan={group.products.length}>
                              {group.countryName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" rowSpan={group.products.length}>
                              {group.salesRepName}
                            </td>
                          </>
                        ) : null}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs break-words">
                          {product.comment || '-'}
                        </td>
                        {index === 0 ? (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" rowSpan={group.products.length}>
                            {new Date(group.latestDate).toLocaleString()}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-sm font-medium text-gray-900">No availability reports found</h3>
                      <p className="text-sm text-gray-500">No reports match the selected filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * limit, total)}
                  </span>{' '}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={total}>All</option>
                  </select>
                </div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outlet
                    </label>
                    <input
                      type="text"
                      value={filters.outlet || ''}
                      onChange={(e) => handleFilterChange('outlet', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter outlet name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment
                    </label>
                    <input
                      type="text"
                      value={filters.comment || ''}
                      onChange={(e) => handleFilterChange('comment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter comment"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={filters.country || ''}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Countries</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sales Rep
                    </label>
                    <select
                      value={filters.salesRep || ''}
                      onChange={(e) => handleFilterChange('salesRep', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Sales Reps</option>
                      {salesReps.map((rep) => (
                        <option key={rep} value={rep}>
                          {rep}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      clearFilters();
                      setShowFilterModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityReportPage;
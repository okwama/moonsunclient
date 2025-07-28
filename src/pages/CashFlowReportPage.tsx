import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Download, 
  BarChart3, 
  Calculator,
  ChevronDown,
  ChevronRight,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface CashFlowItem {
  account_code: string;
  account_name: string;
  net_change: number;
}

interface CashFlowSection {
  items: CashFlowItem[];
  total: number;
}

interface CashFlowData {
  period: string;
  operations: CashFlowSection;
  investing: CashFlowSection;
  financing: CashFlowSection;
  net_cash_flow: number;
  opening_balance?: number;
  closing_balance?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CashFlowReportPage: React.FC = () => {
  const [reportData, setReportData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('current_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    operations: true,
    investing: true,
    financing: true
  });

  useEffect(() => {
    fetchCashFlowReport();
    // eslint-disable-next-line
  }, [period, startDate, endDate]);

  const fetchCashFlowReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (period === 'custom' && startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      }
      const res = await axios.get(`${API_BASE_URL}/financial/reports/cash-flow?${params}`);
      if (res.data.success) {
        setReportData(res.data.data);
      } else {
        setError(res.data.error || 'Failed to fetch cash flow report');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cash flow report');
    } finally {
      setLoading(false);
    }
  };

  const number_format = (amount: number) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0.00';
    }
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getCashFlowColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCashFlowIcon = (amount: number) => {
    if (amount > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (amount < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return null;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderCashFlowSection = (
    title: string,
    section: CashFlowSection,
    sectionKey: string,
    color: string
  ) => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div 
        className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">{title}</h4>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-bold ${getCashFlowColor(section.total)}`}>
              {number_format(section.total)}
            </span>
            {expandedSections[sectionKey] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
      </div>
      {expandedSections[sectionKey] && (
        <div className="p-4">
          {section.items.length > 0 ? (
            <div className="space-y-2">
              {section.items.map(item => (
                <div key={item.account_code} className="flex justify-between items-center py-1 hover:bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-16">{item.account_code}</span>
                    <span className="text-sm text-gray-700 flex-1">{item.account_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getCashFlowIcon(item.net_change)}
                    <span className={`text-sm font-medium ${getCashFlowColor(item.net_change)}`}>
                      {number_format(item.net_change)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm py-2">No cash flow items found.</div>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cash Flow Statement</h1>
              <p className="text-gray-600 mt-1">
                Cash flows from operating, investing, and financing activities for {reportData?.period}
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-6">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current_month">Current Month</option>
                <option value="current_quarter">Current Quarter</option>
                <option value="current_year">Current Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            {period === 'custom' && (
              <>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">End Date:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Operating Cash Flow</p>
                    <p className={`text-2xl font-bold ${getCashFlowColor(reportData.operations.total)}`}>
                      {number_format(reportData.operations.total)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Investing Cash Flow</p>
                    <p className={`text-2xl font-bold ${getCashFlowColor(reportData.investing.total)}`}>
                      {number_format(reportData.investing.total)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Financing Cash Flow</p>
                    <p className={`text-2xl font-bold ${getCashFlowColor(reportData.financing.total)}`}>
                      {number_format(reportData.financing.total)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Calculator className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                    <p className={`text-2xl font-bold ${getCashFlowColor(reportData.net_cash_flow)}`}>
                      {number_format(reportData.net_cash_flow)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Flow Statement */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Statement of Cash Flows for {reportData.period}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Operating Activities */}
                {renderCashFlowSection(
                  'Cash Flows from Operating Activities',
                  reportData.operations,
                  'operations',
                  'blue'
                )}

                {/* Investing Activities */}
                {renderCashFlowSection(
                  'Cash Flows from Investing Activities',
                  reportData.investing,
                  'investing',
                  'green'
                )}

                {/* Financing Activities */}
                {renderCashFlowSection(
                  'Cash Flows from Financing Activities',
                  reportData.financing,
                  'financing',
                  'purple'
                )}

                {/* Net Cash Flow */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Net Increase (Decrease) in Cash</span>
                    <span className={`text-lg font-bold ${getCashFlowColor(reportData.net_cash_flow)}`}>
                      {number_format(reportData.net_cash_flow)}
                    </span>
                  </div>
                </div>

                {/* Cash Flow Analysis */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Cash Flow Analysis</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    {reportData.operations.total > 0 ? (
                      <p>✓ Positive operating cash flow indicates healthy business operations</p>
                    ) : (
                      <p>⚠ Negative operating cash flow may indicate operational challenges</p>
                    )}
                    {reportData.investing.total < 0 ? (
                      <p>✓ Negative investing cash flow typically indicates capital investments</p>
                    ) : (
                      <p>ℹ Positive investing cash flow may indicate asset sales</p>
                    )}
                    {reportData.financing.total > 0 ? (
                      <p>ℹ Positive financing cash flow indicates external funding or debt</p>
                    ) : (
                      <p>ℹ Negative financing cash flow indicates debt repayment or dividends</p>
                    )}
                    {reportData.net_cash_flow > 0 ? (
                      <p>✓ Overall positive cash flow strengthens financial position</p>
                    ) : (
                      <p>⚠ Overall negative cash flow may require attention to cash management</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Flow Metrics */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Cash Flow Metrics</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Operating Cash Flow Ratio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.operations.total > 0 ? 'Positive' : 'Negative'}
                    </p>
                    <p className="text-xs text-gray-500">Operating cash flow health</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Cash Flow Coverage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.abs(reportData.operations.total) > Math.abs(reportData.financing.total) ? 'Good' : 'Monitor'}
                    </p>
                    <p className="text-xs text-gray-500">Operating vs financing cash flow</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Cash Flow Trend</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.net_cash_flow > 0 ? 'Improving' : 'Declining'}
                    </p>
                    <p className="text-xs text-gray-500">Overall cash position trend</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CashFlowReportPage; 
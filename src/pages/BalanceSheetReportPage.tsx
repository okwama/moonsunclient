import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, TrendingDown, Filter, Download } from 'lucide-react';

interface Account {
  account_code: string;
  account_name: string;
  account_type: string;
  balance: number;
}

interface BalanceSheetData {
  as_of_date: string;
  assets: Account[];
  liabilities: Account[];
  equity: Account[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  total_liabilities_and_equity: number;
  net_book_value?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BalanceSheetReportPage: React.FC = () => {
  const [reportData, setReportData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asOfDate, setAsOfDate] = useState('');

  useEffect(() => {
    fetchBalanceSheetReport();
    // eslint-disable-next-line
  }, [asOfDate]);

  const fetchBalanceSheetReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (asOfDate) params.append('as_of_date', asOfDate);
      const res = await axios.get(`${API_BASE_URL}/financial/reports/balance-sheet?${params}`);
      if (res.data.success) {
        setReportData(res.data.data);
      } else {
        setError(res.data.error || 'Failed to fetch balance sheet report');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch balance sheet report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Balance Sheet Report</h1>
              <p className="text-gray-600 mt-1">Assets, Liabilities, and Equity as of {reportData?.as_of_date}</p>
            </div>
            <div className="flex space-x-3">
              {/* Export CSV button can be added here if needed */}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">As of Date:</label>
            <input
              type="date"
              value={asOfDate}
              onChange={e => setAsOfDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Assets</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reportData.total_assets)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Liabilities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reportData.total_liabilities)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Equity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reportData.total_equity)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Liabilities + Equity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reportData.total_liabilities_and_equity)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Net Book Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.net_book_value !== undefined ? formatCurrency(reportData.net_book_value) : '--'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Balance Sheet as of {reportData.as_of_date}</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Assets */}
                <div>
                  <h4 className="text-lg font-medium text-green-700 mb-4">Assets</h4>
                  {reportData.assets.length > 0 ? reportData.assets.map(acc => (
                    <div key={acc.account_code} className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">{acc.account_name} ({acc.account_code})</span>
                      <span className="font-medium">{formatCurrency(acc.balance)}</span>
                    </div>
                  )) : <div className="text-gray-500">No assets found.</div>}
                  <div className="flex justify-between items-center border-t pt-3 mt-3">
                    <span className="font-semibold text-gray-900">Total Assets</span>
                    <span className="font-bold text-gray-900">{formatCurrency(reportData.total_assets)}</span>
                  </div>
                  {reportData.net_book_value !== undefined && (
                    <div className="flex justify-between items-center border-t pt-3 mt-3">
                      <span className="font-semibold text-gray-900">Net Book Value (Assets - Accum. Depreciation)</span>
                      <span className="font-bold text-gray-900">{formatCurrency(reportData.net_book_value)}</span>
                    </div>
                  )}
                </div>
                {/* Liabilities */}
                <div>
                  <h4 className="text-lg font-medium text-red-700 mb-4">Liabilities</h4>
                  {reportData.liabilities.length > 0 ? (
                    <table className="min-w-full text-sm text-gray-700 border rounded">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-2 py-1 text-left">Account Name</th>
                          <th className="px-2 py-1 text-left">Account Code</th>
                          <th className="px-2 py-1 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.liabilities.map((acc, idx) => (
                          <tr key={acc.account_code || acc.account_name || idx} className="border-b last:border-b-0">
                            <td className="px-2 py-1">{acc.account_name}</td>
                            <td className="px-2 py-1">{acc.account_code}</td>
                            <td className="px-2 py-1 text-right">{formatCurrency(acc.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-2 py-1" colSpan={2}>Total Liabilities</td>
                          <td className="px-2 py-1 text-right">{formatCurrency(reportData.total_liabilities)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : <div className="text-gray-500">No liabilities found.</div>}
                </div>
                {/* Equity */}
                <div>
                  <h4 className="text-lg font-medium text-blue-700 mb-4">Equity</h4>
                  {reportData.equity.length > 0 ? reportData.equity.map(acc => (
                    <div key={acc.account_code} className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">{acc.account_name} ({acc.account_code})</span>
                      <span className="font-medium">{formatCurrency(acc.balance)}</span>
                    </div>
                  )) : <div className="text-gray-500">No equity accounts found.</div>}
                  <div className="flex justify-between items-center border-t pt-3 mt-3">
                    <span className="font-semibold text-gray-900">Total Equity</span>
                    <span className="font-bold text-gray-900">{formatCurrency(reportData.total_equity)}</span>
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

export default BalanceSheetReportPage; 
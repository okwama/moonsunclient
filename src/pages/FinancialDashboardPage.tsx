import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  FileText,
  CreditCard,
  Building,
  BarChart3,
  BoxIcon
} from 'lucide-react';
import { dashboardService } from '../services/financialService';
import { DashboardStats } from '../types/financial';
import { Link } from 'react-router-dom';

const FinancialDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      setError('Failed to fetch dashboard stats');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchDashboardStats}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your retail business finances</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/reports/profit-loss"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Link>
              <Link
                to="/assets/depreciation"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <BoxIcon className="w-4 h-4 mr-2" />
                Asset Depreciation
              </Link>
              <Link
                to="/equity/manage"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Manage Equity
              </Link>
              <Link
                to="/all-orders"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {/* Total Sales */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatCurrency(stats.totalSales) : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Total Purchases */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatCurrency(stats.totalPurchases) : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Receivables */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receivables</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatCurrency(stats.totalReceivables) : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Payables */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payables</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatCurrency(stats.totalPayables) : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Total Assets */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Building className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatCurrency(stats.totalAssets) : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? stats.lowStockItems : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? stats.pendingOrders : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => window.location.href = '/financial/purchase-order'}
                  className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">New Purchase</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/create-invoice'}
                  className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Create Invoice</span>
                </button>
              
                <button 
                  onClick={() => window.location.href = '/add-expense'}
                  className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium">Add Expense</span>
                </button>
                 
                <button 
                  onClick={() => window.location.href = '/assets/add'}
                  className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Building className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium">Add Asset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New sale recorded</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Purchase order created</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Payment received</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Chart of Accounts */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Chart of Accounts</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Manage your accounting structure and account codes</p>
            <div className="flex items-center text-sm text-indigo-600">
              <span>View accounts</span>
              <TrendingUp className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Balance Sheet Report */}
          <div 
            onClick={() => window.location.href = '/reports/balance-sheet'}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Balance Sheet</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">View your assets, liabilities, and equity at a glance</p>
            <div className="flex items-center text-sm text-blue-600">
              <span>View balance sheet</span>
              <TrendingUp className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Suppliers */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Suppliers</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Manage your supplier relationships and information</p>
            <div className="flex items-center text-sm text-blue-600">
              <span>View suppliers</span>
              <TrendingUp className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Customers</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Manage your customer database and relationships</p>
            <div className="flex items-center text-sm text-green-600">
              <span>View customers</span>
              <TrendingUp className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Inventory */}
          <div 
            onClick={() => window.location.href = '/store-inventory'}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Store Inventory</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Track inventory levels across all stores</p>
            <div className="flex items-center text-sm text-purple-600">
              <span>View inventory</span>
              <TrendingUp className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Purchase Orders */}
          <div 
            onClick={() => window.location.href = '/purchase-orders'}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Purchase Orders</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Create and manage purchase orders from suppliers</p>
            <div className="flex items-center text-sm text-orange-600">
              <span>View orders</span>
              <TrendingUp className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Sales Orders */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Sales Orders</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Create and manage sales orders for customers</p>
            <div className="flex items-center text-sm text-red-600">
              <span>View orders</span>
              <TrendingUp className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Receipts */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Receipts</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Record customer payments and receipts</p>
            <div className="flex items-center text-sm text-yellow-600">
              <span>View receipts</span>
              <TrendingUp className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Payments</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Record payments to suppliers and vendors</p>
            <div className="flex items-center text-sm text-gray-600">
              <span>View payments</span>
              <TrendingUp className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Payables */}
          <Link to="/payables" className="block bg-white rounded-lg shadow hover:shadow-md p-6 text-center border border-gray-200 hover:border-blue-500 transition">
            <div className="text-3xl mb-2">💸</div>
            <div className="text-lg font-semibold">Payables</div>
            <div className="text-sm text-gray-500 mt-1">View & manage supplier payables</div>
          </Link>

          {/* Receivables */}
          <Link to="/receivables" className="block bg-white rounded-lg shadow hover:shadow-md p-6 text-center border border-gray-200 hover:border-green-500 transition">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-lg font-semibold">Receivables</div>
            <div className="text-sm text-gray-500 mt-1">View & manage customer receivables</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboardPage; 
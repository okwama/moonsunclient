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
  BoxIcon,
  Clock,
  Plus,
  ChevronRight,
  Activity,
  Zap,
  Settings,
  Bell,
  Search,
  Filter,
  Notebook
} from 'lucide-react';
import { dashboardService } from '../services/financialService';
import type { DashboardStats } from '../types/financial';
import { useNavigate } from 'react-router-dom';

const FinancialDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    dashboardService.getStats()
      .then(res => {
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          setError(res.error || 'Failed to load dashboard stats');
        }
      })
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const quickActions = [
    { name: 'New Purchase', icon: ShoppingCart, color: 'blue', href: '/financial/purchase-order' },
    { name: 'Create Invoice', icon: FileText, color: 'green', href: '/create-invoice' },
    { name: 'Add Expense', icon: DollarSign, color: 'red', href: '/add-expense' },
    { name: 'Chat Room', icon: Notebook, color: 'purple', href: '/chat-room' },
    { name: 'Equity Entries', icon: DollarSign, color: 'emerald', href: '/equity/entries', featured: true },
    { name: 'Add Journal Entry', icon: FileText, color: 'amber', href: '/add-journal-entry', featured: true }
  ];

  const navigationCards = [
    { title: 'Chart of Accounts', desc: 'Manage accounting structure', icon: BarChart3, color: 'indigo', href: '/chart-of-accounts' },
    { title: 'Financial Reports', desc: 'View financial reporting', icon: BarChart3, color: 'blue', href: '/reports' },
    { title: 'Vendors', desc: 'Manage vendor information', icon: Building, color: 'slate', href: '/suppliers' },
    { title: 'Customers', desc: 'Manage customer database', icon: Users, color: 'green', href: '/clients' },
    { title: 'Store Inventory', desc: 'Track inventory levels', icon: Package, color: 'purple', href: '/store-inventory' },
    { title: 'Assets', desc: 'View and manage all assets', icon: BoxIcon, color: 'teal', href: '/assets' },
    { title: 'Expenses', desc: 'View all expenses', icon: DollarSign, color: 'red', href: '/expenses' },
    { title: 'Products', desc: 'View and manage all products', icon: BoxIcon, color: 'teal', href: '/products' },
    { title: 'Purchase Orders', desc: 'Manage purchase orders', icon: ShoppingCart, color: 'orange', href: '/purchase-orders' },
    { title: 'Sales Orders', desc: 'Manage sales orders', icon: DollarSign, color: 'red', href: '/all-orders' },
    { title: 'Receipts', desc: 'Record customer payments', icon: CreditCard, color: 'yellow', href: '/receipts' },
    { title: 'Payroll Management', desc: 'Record staff payroll', icon: CreditCard, color: 'yellow', href: '/payroll-management' },
    { title: 'Journal Entries', desc: 'View all journal entries', icon: FileText, color: 'amber', href: '/journal-entries' }
  ];

  const financialCards = [
    { title: 'Payables', desc: 'View & manage supplier payables', emoji: '💸', href: '/payables', color: 'rose' },
    { title: 'Receivables', desc: 'View & manage customer receivables', emoji: '💰', href: '/receivables', color: 'emerald' },
    { title: 'Pending Payments', desc: 'Review & confirm payments', emoji: '⏰', href: '/pending-payments', color: 'amber' },
    { title: 'Cash & Equivalents', desc: 'View all cash accounts', emoji: '🏦', href: '/cash-equivalents', color: 'blue' }
  ];

  // const managementTools = [
  //   // { title: 'Asset Depreciation', icon: BoxIcon, href: '/assets/depreciation', color: 'blue' },
  //   // { title: 'Products', icon: Package, href: '/products', color: 'purple' },
  //   // { title: 'Manage Equity', icon: DollarSign, href: '/equity/manage', color: 'blue' },
  //   // { title: 'Payroll Management', icon: Users, href: '/payroll-management', color: 'green' }
  // ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Financial Dashboard
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button 
              onClick={() => navigate('/settings')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Management Tools Bar */}
        {/* <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Management Tools</h2>
            <Filter className="w-5 h-5 text-slate-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {managementTools.map((tool, index) => (
              <button
                key={index}
                onClick={() => window.location.href = tool.href}
                className={`group flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 hover:border-${tool.color}-300`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${tool.color}-100 rounded-lg group-hover:bg-${tool.color}-200 transition-colors`}>
                    <tool.icon className={`w-5 h-5 text-${tool.color}-600`} />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">{tool.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </button>
            ))}
          </div>
        </div> */}

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Financial Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats ? formatCurrency(stats.totalSales) : '$0.00'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Purchases</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats ? formatCurrency(stats.totalPurchases) : '$0.00'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Receivables</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats ? formatCurrency(stats.totalReceivables) : '$0.00'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Payables</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats ? formatCurrency(stats.totalPayables) : '$0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button 
                    key={index}
                    onClick={() => window.location.href = action.href}
                    className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                      action.featured 
                        ? `border-2 border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 hover:border-${action.color}-300`
                        : 'border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mb-2 ${
                      action.featured 
                        ? `bg-${action.color}-200 group-hover:bg-${action.color}-300`
                        : `bg-${action.color}-100 group-hover:bg-${action.color}-200`
                    }`}>
                      <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <span className={`text-sm font-medium text-center ${
                      action.featured ? `text-${action.color}-700` : 'text-slate-700'
                    }`}>
                      {action.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">New sale recorded</p>
                    <p className="text-xs text-slate-500">Invoice #INV-2024-001 • $2,450.00</p>
                    <p className="text-xs text-slate-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Purchase order created</p>
                    <p className="text-xs text-slate-500">PO #PO-2024-032 • Supplier ABC</p>
                    <p className="text-xs text-slate-400">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Payment received</p>
                    <p className="text-xs text-slate-500">Customer XYZ • $1,200.00</p>
                    <p className="text-xs text-slate-400">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Inventory update</p>
                    <p className="text-xs text-slate-500">12 items marked as low stock</p>
                    <p className="text-xs text-slate-400">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Management */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Financial Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialCards.map((card, index) => (
              <button
                key={index}
                onClick={() => window.location.href = card.href}
                className={`group bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md hover:border-${card.color}-300 transition-all duration-200`}
              >
                <div className="text-4xl mb-3">{card.emoji}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{card.desc}</p>
                <div className="flex items-center justify-center text-sm text-slate-500 group-hover:text-slate-700">
                  <span>View details</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Business Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {navigationCards.map((card, index) => (
              <button
                key={index}
                onClick={() => window.location.href = card.href}
                className={`group bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-${card.color}-300 transition-all duration-200 text-left`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${card.color}-100 rounded-xl group-hover:bg-${card.color}-200 transition-colors`}>
                    <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{card.desc}</p>
                <div className={`flex items-center text-sm text-${card.color}-600 font-medium`}>
                  <span>Access now</span>
                  <TrendingUp className="w-4 h-4 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboardPage;
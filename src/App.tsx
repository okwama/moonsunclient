import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Overview from './components/Dashboard/Overview';
import ClientDetailsPage from './pages/ClientDetailsPage';
import UnscheduledRequests from './pages/UnscheduledRequests';
import PhotoListPage from './pages/PhotoListPage';
import StaffList from './pages/StaffList';
import SoSList from './pages/Sos';
import TeamsList from './pages/TeamList';
import ClientsList from './pages/ClientsPage';
import ClaimsPage from './pages/ClaimsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';
import PendingRequests from './pages/PendingRequests';
import InTransitRequests from './pages/InTransitRequests';
import AddClientPage from './pages/AddClientPage';
import ClientBranchesPage from './pages/ClientBranchesPage';
import FinancialDashboardPage from './pages/FinancialDashboardPage';
import PurchaseOrderPage from './pages/PurchaseOrderPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PurchaseOrderDetailsPage from './pages/PurchaseOrderDetailsPage';
import ReceiveItemsPage from './pages/ReceiveItemsPage';
import StoreInventoryPage from './pages/StoreInventoryPage';
import PayablesPage from './pages/PayablesPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import ReceivablesPage from './pages/ReceivablesPage';
import ProfitLossReportPage from './pages/ProfitLossReportPage';
import AddExpensePage from './pages/AddExpensePage';
import AddAssetPage from './pages/AddAssetPage';
import BalanceSheetReportPage from './pages/BalanceSheetReportPage';
import AssetDepreciationPage from './pages/AssetDepreciationPage';
import AddEquityPage from './pages/AddEquityPage';
import AllOrdersPage from './pages/AllOrdersPage';
import SalesOrderDetailsPage from './pages/SalesOrderDetailsPage';
import HrDashboardPage from './pages/HrDashboardPage';
import AddEmployeePage from './pages/AddEmployeePage';
import EmployeesPage from './pages/EmployeesPage';
import DepartmentsPage from './pages/DepartmentsPage';
import EmployeeWarningsPage from './pages/EmployeeWarningsPage';
import ChatRoomPage from './pages/ChatRoomPage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';
import UploadDocumentPage from './pages/UploadDocumentPage';
import DocumentListPage from './pages/DocumentListPage';

// Protected route wrapper
const ProtectedRoute = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Redirect authenticated users away from login
const LoginRoute = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'hr') {
      return <Navigate to="/hr-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
};

// Dashboard layout wrapper
const DashboardWrapper = () => {
  const { user } = useAuth();
  // Redirect HR users to HR dashboard
  if (user && user.role === 'hr') {
    return <Navigate to="/hr-dashboard" replace />;
  }
  return (
    <Layout>
      <DashboardLayout />
    </Layout>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginRoute />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardWrapper />}>
          <Route path="/" element={<FinancialDashboardPage />} />
          <Route path="/dashboard" element={<FinancialDashboardPage />} />
          <Route path="/financial" element={<FinancialDashboardPage />} />
          <Route path="/dashboard/unscheduled" element={<UnscheduledRequests />} />
          <Route path="/dashboard/pending" element={<PendingRequests />} />
          <Route path="/dashboard/in-transit" element={<InTransitRequests />} />
          <Route path="/dashboard/clients/:id" element={<ClientDetailsPage />} />
          <Route path="/dashboard/photo-list" element={<PhotoListPage />} />
          <Route path="/dashboard/staff-list" element={<StaffList/>} />
          <Route path="/dashboard/sos-list" element={<SoSList/>} />
          <Route path="/dashboard/teams-list" element={<TeamsList/>} />
          <Route path="/dashboard/clients-list" element={<ClientsList/>} />
          <Route path="/dashboard/claims" element={<ClaimsPage />} />
          <Route path="/dashboard/reports" element={<ReportsPage />} />
          <Route path="/dashboard/reports/profit-loss" element={<ProfitLossReportPage />} />
          <Route path="/dashboard/reports/balance-sheet" element={<BalanceSheetReportPage />} />
          <Route path="/dashboard/clients/add" element={<AddClientPage />} />
          <Route path="/dashboard/clients/:id/branches" element={<ClientBranchesPage />} />
          <Route path="/financial/purchase-order" element={<PurchaseOrderPage />} />
          <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailsPage />} />
          <Route path="/receive-items/:purchaseOrderId" element={<ReceiveItemsPage />} />
          <Route path="/store-inventory" element={<StoreInventoryPage />} />
          <Route path="/payables" element={<PayablesPage />} />
          <Route path="/receivables" element={<ReceivablesPage />} />
          <Route path="/reports/profit-loss" element={<ProfitLossReportPage />} />
          <Route path="/reports/balance-sheet" element={<BalanceSheetReportPage />} />
          <Route path="/create-invoice" element={<CreateInvoicePage />} />
          <Route path="/add-expense" element={<AddExpensePage />} />
          <Route path="/assets/add" element={<AddAssetPage />} />
          <Route path="/assets/depreciation" element={<AssetDepreciationPage />} />
          <Route path="/equity/manage" element={<AddEquityPage />} />
          <Route path="/all-orders" element={<AllOrdersPage />} />
          <Route path="/sales-orders/:id" element={<SalesOrderDetailsPage />} />
        </Route>

        {/* HR Dashboard and related routes */}
        <Route path="/hr-dashboard" element={<Layout><HrDashboardPage /></Layout>} />
        <Route path="/hr/add-employee" element={<Layout><AddEmployeePage /></Layout>} />
        <Route path="/hr/employees" element={<Layout><EmployeesPage /></Layout>} />
        <Route path="/hr/departments" element={<Layout><DepartmentsPage /></Layout>} />
        <Route path="/hr/warnings" element={<Layout><EmployeeWarningsPage /></Layout>} />
        <Route path="/attendance-history" element={<Layout><AttendanceHistoryPage /></Layout>} />
        <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        <Route path="/chat-room" element={<Layout><ChatRoomPage /></Layout>} />
        <Route path="/upload-document" element={<Layout><UploadDocumentPage /></Layout>} />
        <Route path="/documents" element={<Layout><DocumentListPage /></Layout>} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
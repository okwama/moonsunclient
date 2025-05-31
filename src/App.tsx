import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Overview from './components/Dashboard/Overview';
import ClientDetailPage from './pages/ClientDetailPage';
import UnscheduledRequests from './pages/UnscheduledRequests';
import PhotoListPage from './pages/PhotoListPage';
import ClaimsPage from './pages/ClaimsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';
import PendingRequests from './pages/PendingRequests';
import InTransitRequests from './pages/InTransitRequests';

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
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
};

// Dashboard layout wrapper
const DashboardWrapper = () => {
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
          <Route path="/" element={<UnscheduledRequests />} />
          <Route path="/dashboard" element={<UnscheduledRequests />} />
          <Route path="/dashboard/unscheduled" element={<UnscheduledRequests />} />
          <Route path="/dashboard/pending" element={<PendingRequests />} />
          <Route path="/dashboard/in-transit" element={<InTransitRequests />} />
          <Route path="/dashboard/clients/:id" element={<ClientDetailPage />} />
          <Route path="/dashboard/photo-list" element={<PhotoListPage />} />
          <Route path="/dashboard/claims" element={<ClaimsPage />} />
          <Route path="/dashboard/reports" element={<ReportsPage />} />
        </Route>
        
        <Route path="/settings" element={
          <Layout>
            <SettingsPage />
          </Layout>
        } />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
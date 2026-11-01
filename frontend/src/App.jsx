import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import JobListPage from './pages/jobs/JobListPage';
import CandidateListPage from './pages/candidates/CandidateListPage';
import KanbanBoardPage from './pages/pipeline/KanbanBoardPage';
import InterviewListPage from './pages/interviews/InterviewListPage';
import CommunicationPage from './pages/communication/CommunicationPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import UserManagementPage from './pages/users/UserManagementPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/candidates" element={<CandidateListPage />} />
              <Route path="/pipeline" element={<KanbanBoardPage />} />
              <Route path="/interviews" element={<InterviewListPage />} />
              <Route path="/communication" element={<CommunicationPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* Admin Only Route */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_HR_ADMIN', 'HR_ADMIN']} />}>
                <Route path="/users" element={<UserManagementPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


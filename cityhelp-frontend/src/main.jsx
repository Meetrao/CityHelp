import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import LoginPage from './pages/LoginPage';
import ReportIssue from './pages/ReportIssue';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
<Routes>
  <Route path="/" element={<LoginPage />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/report" element={<ReportIssue />} />
  <Route path="/" element={<LoginPage />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/report"
    element={
      <ProtectedRoute>
        <ReportIssue />
      </ProtectedRoute>
    }
  />
</Routes>


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/report" element={<ReportIssue />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import HoursWorkedPage from '../pages/HoursWorkedPage';
import HoursWorkedEditPage from '../pages/HoursWorkedEditPage';
import HoursWorkedDetailPage from '../pages/HoursWorkedDetailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import ReportsPage from '../pages/ReportsPage';
import ReportsEditPage from '../pages/ReportsEditPage';
import InvoicePage from '../pages/InvoicePage';
import InvoiceEditPage from '../pages/InvoiceEditPage';
import InvoiceDetailPage from '../pages/InvoiceDetailPage';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute isAuth={!!user}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/horas-trabajadas" element={
          <ProtectedRoute isAuth={!!user}>
            <HoursWorkedPage />
          </ProtectedRoute>
        } />
        <Route path="/horas-trabajadas/nueva" element={
          <ProtectedRoute isAuth={!!user}>
            <HoursWorkedEditPage />
          </ProtectedRoute>
        } />
        <Route path="/horas-trabajadas/editar/:id" element={
          <ProtectedRoute isAuth={!!user}>
            <HoursWorkedEditPage />
          </ProtectedRoute>
        } />
        <Route path="/horas-trabajadas/detalle/:id" element={
          <ProtectedRoute isAuth={!!user}>
            <HoursWorkedDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/reportes" element={
          <ProtectedRoute isAuth={!!user}>
            <ReportsPage />
          </ProtectedRoute>
        } />
        <Route path="/reportes/nuevo" element={
          <ProtectedRoute isAuth={!!user}>
            <ReportsEditPage/>
          </ProtectedRoute>
        } />
        <Route path="/reportes/editar/:id" element={
          <ProtectedRoute isAuth={!!user}>
            <ReportsEditPage />
          </ProtectedRoute>
        } />
        <Route path="/facturas" element={
          <ProtectedRoute isAuth={!!user}>
            <InvoicePage />
          </ProtectedRoute>
        } />
        <Route path="/facturas/crear" element={
          <ProtectedRoute isAuth={!!user}>
            <InvoiceEditPage />
          </ProtectedRoute>
        } />
        <Route path="/facturas/editar/:id" element={
          <ProtectedRoute isAuth={!!user}>
            <InvoiceEditPage />
          </ProtectedRoute>
        } />
        <Route path="/facturas/detalle/:id" element={
          <ProtectedRoute isAuth={!!user}>
            <InvoiceDetailPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

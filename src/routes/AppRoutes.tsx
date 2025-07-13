import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import TasksPage from '../pages/TasksPage';
import TaskEditPage from '../pages/TaskEditPage';
import TaskDetailPage from '../pages/TaskDetailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import ModuleTemplate from '../layouts/ModuleTemplate';

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
        <Route path="/tareas" element={
          <ProtectedRoute isAuth={!!user}>
            <TasksPage />
          </ProtectedRoute>
        } />
        <Route path="/tareas/nueva" element={
          <ProtectedRoute isAuth={!!user}>
            <TaskEditPage />
          </ProtectedRoute>
        } />
        <Route path="/tareas/editar/:id" element={
          <ProtectedRoute isAuth={!!user}>
            <TaskEditPage />
          </ProtectedRoute>
        } />
        <Route path="/tareas/detalle/:id" element={
          <ProtectedRoute isAuth={!!user}>
            <TaskDetailPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuth: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuth, children }) => {
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;

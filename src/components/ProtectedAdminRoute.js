import React from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedLayout from './ProtectedLayout';

const ProtectedAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.roles?.roleName !== 'Admin') {
    return <Navigate to="/login" />;
  }

  return <ProtectedLayout requiredRole="Admin">{children}</ProtectedLayout>;
};

export default ProtectedAdminRoute;
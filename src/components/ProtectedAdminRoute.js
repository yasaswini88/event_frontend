import React from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedLayout from './ProtectedLayout';

const ProtectedAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.roles?.roleId !== 1) {
    return <Navigate to="/" />;
  }

  return <ProtectedLayout requiredRoleId={1}>{children}</ProtectedLayout>;
};

export default ProtectedAdminRoute;
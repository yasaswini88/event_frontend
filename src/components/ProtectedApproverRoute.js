import React from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedLayout from './ProtectedLayout';

const ProtectedApproverRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.roles?.roleId !== 3) {
    return <Navigate to="/login" />;
  }

  return <ProtectedLayout requiredRoleIdId={3}>{children}</ProtectedLayout>;
};

export default ProtectedApproverRoute;
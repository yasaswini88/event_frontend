import React from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedLayout from './ProtectedLayout';

const ProtectedApproverRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.roles?.roleName !== 'Approver') {
    return <Navigate to="/login" />;
  }

  return <ProtectedLayout requiredRole="Approver">{children}</ProtectedLayout>;
};

export default ProtectedApproverRoute;
// ProtectedPurchaserRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedLayout from './ProtectedLayout';

const ProtectedPurchaserRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.roles?.roleName !== 'Purchaser') {
    return <Navigate to="/login" />;
  }

  return <ProtectedLayout requiredRole="Purchaser">{children}</ProtectedLayout>;
};

export default ProtectedPurchaserRoute;
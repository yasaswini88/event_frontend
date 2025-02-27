// ProtectedPurchaserRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedLayout from './ProtectedLayout';

const ProtectedPurchaserRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // if (!user || user.roles?.roleId !== 4) {
  //   return <Navigate to="/" />;
  // }

   if (!user || !user.roles.some(r => r.roleId === 4)) {
      return <Navigate to="/" />;
    }

  return <ProtectedLayout requiredRoleId={4}>{children}</ProtectedLayout>;
};

export default ProtectedPurchaserRoute;
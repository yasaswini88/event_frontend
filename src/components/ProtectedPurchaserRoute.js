import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectRole } from '../redux/authSlice';
import ProtectedLayout from './ProtectedLayout';

const ProtectedPurchaserRoute = ({ children }) => {
  const role = useSelector(selectRole); // Fetch role from Redux state

  if (!role || role !== 'Purchaser') {
    return <Navigate to="/" />;
  }

  return <ProtectedLayout requiredRole="Purchaser">{children}</ProtectedLayout>;
};

export default ProtectedPurchaserRoute;

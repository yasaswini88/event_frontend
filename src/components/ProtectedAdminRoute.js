import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectRole } from '../redux/authSlice';
import ProtectedLayout from './ProtectedLayout';

const ProtectedAdminRoute = ({ children }) => {
  const role = useSelector(selectRole);

  if (!role || role !== 'Admin') {
    return <Navigate to="/" />;
  }

  return <ProtectedLayout requiredRole="Admin">{children}</ProtectedLayout>;
};

export default ProtectedAdminRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectRole } from '../redux/authSlice';
import ProtectedLayout from './ProtectedLayout';

const ProtectedApproverRoute = ({ children }) => {
  const role = useSelector(selectRole);

  if (!role || role !== 'Approver') {
    return <Navigate to="/" />;
  }

  return <ProtectedLayout requiredRole="Approver">{children}</ProtectedLayout>;
};

export default ProtectedApproverRoute;

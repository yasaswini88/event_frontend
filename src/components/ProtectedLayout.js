import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectRole } from '../redux/authSlice';
import { Box } from '@mui/material';
import CommonAppBar from './CommonAppBar';

const ProtectedLayout = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();
  const role = useSelector(selectRole);

  useEffect(() => {
    if (!role) {
      navigate('/');
      return;
    }

    if (requiredRole && role !== requiredRole) {
      // Redirect based on role if accessing the wrong area
      switch (role) {
        case 'Admin':
          navigate('/admin-dashboard');
          break;
        case 'Approver':
          navigate('/approver-dashboard');
          break;
        case 'Purchaser':
          navigate('/purchaser-dashboard');
          break;
        default:
          navigate('/proposal');
      }
    }
  }, [navigate, requiredRole, role]);

  if (!role) return null;

  return (
    <Box>
      <CommonAppBar />
      <Box sx={{ paddingTop: '64px' }}>{children}</Box>
    </Box>
  );
};

export default ProtectedLayout;

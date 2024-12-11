import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import CommonAppBar from './CommonAppBar';

const ProtectedLayout = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  
    if (requiredRole && user.roles?.roleName !== requiredRole) {
      // Redirect based on role if they're accessing the wrong area
      switch (user.roles?.roleName) {
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
  }, [navigate, requiredRole, user]);
  

  if (!user) return null;

  return (
    <Box>
      <CommonAppBar />
      <Box sx={{ paddingTop: '64px' }}>{children}</Box>
    </Box>
  );
};

export default ProtectedLayout;
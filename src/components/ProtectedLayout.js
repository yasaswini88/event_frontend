import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import CommonAppBar from './CommonAppBar';

const ProtectedLayout = ({ children, requiredRoleId = null }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  
    if (requiredRoleId && user.roles?.roleId !== requiredRoleId) {
      // Redirect based on role if they're accessing the wrong area
      switch (user.roles?.roleId) {
        case 1:
          navigate('/admin-dashboard');
          break;
        case 3:
          navigate('/approver-dashboard');
          break;
        case 4:
          navigate('/purchaser-dashboard');
          break;
        default:
          navigate('/proposal');
      }
    }
  }, [navigate, requiredRoleId, user]);
  

  if (!user) return null;

  return (
    <Box>
      <CommonAppBar />
      <Box sx={{ paddingTop: '64px' }}>{children}</Box>
    </Box>
  );
};

export default ProtectedLayout;
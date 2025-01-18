import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import CommonAppBar from './CommonAppBar';

const ProtectedLayout = ({ children, requiredRoleId = null }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  
    if (requiredRoleId && !user.roles.some(r => r.roleId === requiredRoleId)) {
      // The user does NOT have the required role => let's redirect
      // But we also want to see if the user *does* have some other role
      if (user.roles.some(r => r.roleId === 1)) {
        navigate('/admin-dashboard');
      } else if (user.roles.some(r => r.roleId === 3)) {
        navigate('/approver-dashboard');
      } else if (user.roles.some(r => r.roleId === 4)) {
        navigate('/purchaser-dashboard');
      } else {
        // If none match (like faculty?), go to /proposal
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
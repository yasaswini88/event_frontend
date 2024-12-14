import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Box, Typography, Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material'; // Updated import

const CommonAppBar = ({ showLogout = true }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    // navigate('/login');
    navigate('/');
    window.location.href = '/';
  };

  const getUserName = () => {
    if (!user) return 'Guest';
    const roles = user.roles || {};
    return `${user.firstName} ${user.lastName} `;
   // (${roles.roleName || 'User'})
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://www.odu.edu/sites/default/files/styles/wysiwyg_300w/public/images/1599596551953.jpg"
            alt="Crown Logo"
            style={{ height: 40, marginRight: 16 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              backgroundColor: '#1a237e',
              color: '#fff',
              padding: '8px 16px',
              clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'inherit' }}>
              {getUserName()}
            </Typography>
          </Box>
          {showLogout && (
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />} // Updated icon
              variant="outlined"
              color="primary"
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CommonAppBar;
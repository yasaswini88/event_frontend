import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Popover,
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import Layout from './Layout'; // Import the Layout component
import MenuIcon from '@mui/icons-material/Menu';
import RoleSelectionDialog from './RoleSelectionDialog';

const CommonAppBar = ({ showLogout = true }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const roles = user?.roles ? Array.from(user.roles) : [];

  const handleOpenRoleDialog = () => {
    setShowRoleSelection(true);
  };

  const handleCloseRoleDialog = () => {
    setShowRoleSelection(false);
  };


  const handleRoleSelect = (roleId) => {
    setShowRoleSelection(false);
  
    // Convert roleId to an integer
    const chosenRoleId = parseInt(roleId, 10);
  
   
    localStorage.setItem('chosenRoleId', chosenRoleId);
  
    // Navigate
    switch (chosenRoleId) {
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
  };


  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.href = '/';
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const getUserName = () => {
    if (!user) return 'Guest';
    return `${user.firstName} ${user.lastName}`;
  };

  const isAdmin = user && user.roles?.some((role) => role.roleId === 1);


  const toggleDrawer = () => {
    if (isAdmin) {
      setDrawerOpen(!drawerOpen);
    }
  };


const hasMultipleRoles = user && user.roles && user.roles.length > 1;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAdmin && (
              <IconButton onClick={toggleDrawer}>
                <MenuIcon sx={{ color: '#1a237e' }} />
              </IconButton>
            )}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: isAdmin ? 'pointer' : 'default',
              }}
              onClick={toggleDrawer}
            >
              <img
                src="https://www.odu.edu/sites/default/files/styles/wysiwyg_300w/public/images/1599596551953.jpg"
                alt="Crown Logo"
                style={{ height: 40 }}
              />
            </Box>
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
            {roles.length > 1 && (
            <Button onClick={handleOpenRoleDialog}>
              Switch Role
            </Button>
          )}
            {showLogout && (
              <>
                <Button
                  onClick={handlePopoverOpen}
                  startIcon={<LogoutIcon />}
                  variant="outlined"
                  color="primary"
                  sx={{ ml: 2 }}
                >
                  Logout
                </Button>
                <Popover
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={handlePopoverClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ mb: 2 }}>
                      Are you sure you want to log out?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        onClick={handlePopoverClose}
                        variant="outlined"
                        color="primary"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="contained"
                        color="secondary"
                      >
                        Logout
                      </Button>
                    </Box>
                  </Box>
                </Popover>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Render the Layout Drawer */}
      {isAdmin && (
        <Layout open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

{showRoleSelection && (
        <RoleSelectionDialog
          open={showRoleSelection}
          onClose={handleCloseRoleDialog}
          roles={roles}
          onRoleSelect={handleRoleSelect}
        />
      )}

      
    </>
  );
};

export default CommonAppBar;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import Login from './Login';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';



const Begin = () => {
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const dispatch = useDispatch();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLoginClick = () => {
    setShowLoginForm(true); // Change this from navigate()
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (userData) {
      try {
        const user = JSON.parse(userData);

        // Redirect based on roleId
        switch (user.roles?.roleId) {
          case 1: // Admin
            navigate('/admin-dashboard');
            break;
          case 3: // Approver
            navigate('/approver-dashboard');
            break;
          case 4: // Purchaser
            navigate('/purchaser-dashboard');
            break;
          default: // Faculty or others
            navigate('/proposal');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/'); // Fallback to home page
      }
    } else {
      navigate('/'); // Redirect to the main page if no user data
    }
  }, [navigate]);

  return (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* Background with overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(https://online.odu.edu/sites/default/files/2021-01/education-building-us-news.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(30, 64, 124, 0.5)',
          }
        }}
      />

      {/* Header Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%'
        }}
      >
        {/* Logo Section */}
        <Box
          sx={{
            position: isMobile ? 'relative' : 'absolute',
            top: isMobile ? '1rem' : '0.8rem',

            left: 0,
            width: isMobile ? '100%' : '300px',
            zIndex: 3
          }}
        >
          <Box
            sx={{
              position: 'relative',
              height: '80px',
              width: '300px',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundColor: '#1a237e',
                clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
              }
            }}
          >
            <Box
              component="img"
              src="https://www.odu.edu/themes/custom/odu/images/odu-logo.svg"
              alt="ODU Logo"
              sx={{
                position: 'relative',
                height: '48px',
                marginLeft: isMobile ? '0' : '1rem',
                marginTop: '0.8rem',
                zIndex: 2
              }}
            />
          </Box>
        </Box>

        {/* Right Header Section */}
        <Box
          sx={{
            position: isMobile ? 'relative' : 'absolute',
            top: isMobile ? '1rem' : '0.8rem',
            right: isMobile ? '0' : '0.8rem',
            width: isMobile ? '100%' : '330px',
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'flex-end',
            zIndex: 3,
            mt: isMobile ? '1rem' : '0',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              height: '50px',
              width: '360px',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundColor: '#1a237e',
                clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)',
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                zIndex: 2
              }}
            >
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.3rem',
                  userSelect: 'none'
                }}
              >
                UniProcure
              </Typography>
              <Box
                sx={{
                  height: '60%',
                  width: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  mx: 2,
                }}
              />
              <Button
                onClick={handleLoginClick}
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '1.25rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 10,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#FFD700',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                Login
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center',
            px: 3,
            zIndex: 2
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Welcome to UniProcure
          </Typography>
          <Typography
            variant="h5"
            sx={{
              maxWidth: '800px',
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              lineHeight: 1.4
            }}
          >
            Streamlining university procurement with efficiency, transparency, and ease.
          </Typography>



          {showLoginForm && <Login />}




        </Box>
      </Box>

    </Box>
  );
};

export default Begin;
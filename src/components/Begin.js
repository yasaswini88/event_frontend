import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const Begin = () => {
  return (
    <Box sx={{ position: 'relative', height: '100vh' }}>
    
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          // backgroundImage: `url(https://b2670330.smushcdn.com/2670330/wp-content/uploads/2023/01/AdobeStock_118993556-scaled.jpeg?size=1920x1280&lossy=1&strip=1&webp=1)`,
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
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo Section */}
        <Box
          sx={{
            position: 'absolute',
            top: '0.8rem',
            left: 0,
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
                backgroundColor: 'white',
                clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
              }
            }}
          >
            <Box
              component="img"
              src="https://www.odu.edu/sites/default/files/logos/univ/png-72dpi/odu-fullsig-blu.png"
              alt="ODU Logo"
              sx={{
                position: 'relative',
                height: '48px',
                marginLeft: '1rem',
                marginTop: '0.8rem',
              }}
            />
          </Box>
        </Box>

        {/* Events365 and Login Section */}
        <Box
          sx={{
            position: 'absolute',
            top: '0.8rem',
            right: '0.8rem',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              height: '50px',
              width: '330px', 
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)',
              }
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
              }}
            >
              <Typography
                sx={{
                  color: 'rgb(30, 64, 124)',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                }}
              >
                Events 365
              </Typography>
              <Box
                sx={{
                  height: '60%',
                  width: '1px',
                  backgroundColor: 'rgba(30, 64, 124, 0.2)',
                  mx: 2,
                }}
              />
              <Button
                sx={{
                  color: 'rgb(30, 64, 124)',
                  fontWeight: 600,
                  fontSize: '1.25rem',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'rgb(51, 102, 204)',
                  },
                }}
              >
                Login
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Begin;
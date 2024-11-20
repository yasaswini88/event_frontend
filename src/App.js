import React from 'react';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import './App.css';

function App() {
  return (
    <div className="App">

      <AppBar position="static" sx={{ height: '13vh', justifyContent: 'center', backgroundColor: '#33eaff' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* ODU Logo */}
            <Box
              component="img"
              src="https://www.odu.edu/sites/default/files/logos/univ/png-72dpi/odu-fullsig-blu.png"
              alt="Logo"
              sx={{ height: '50px', width: 'auto' }}
            />
            {/* Events 365 Text */}
            <Typography
              variant="h2" 
              sx={{
                fontWeight: 'bold',
                fontFamily: '"Roboto Slab", serif', 
                color: '#b28900', 
                fontSize: '2.3rem', 
              }}
            >
              Events 365
            </Typography>

          </Box>

          <Box>
            <Button
              sx={{
                color: '#2c387e',
                fontSize: '1.2rem', // Increase text size
                padding: '10px 20px', // Adjust padding
                minWidth: '150px', // Optional: set minimum width
              }}
            >
              Admin Login
            </Button>
            <Button
              sx={{
                color: '#2c387e',
                fontSize: '1.2rem',
                padding: '10px 20px',
                minWidth: '150px',
              }}
            >
              Organiser Login
            </Button>
            <Button
              sx={{
                color: '#2c387e',
                fontSize: '1.2rem',
                padding: '10px 20px',
                minWidth: '150px',
              }}
            >
              Approver Login
            </Button>
          </Box>


        </Toolbar>
      </AppBar>


      <Box
        component="div"
        sx={{
          height: '80vh',
          backgroundImage: `url(https://b2670330.smushcdn.com/2670330/wp-content/uploads/2023/01/AdobeStock_118993556-scaled.jpeg?size=1920x1280&lossy=1&strip=1&webp=1)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></Box>

    </div>
  );
}

export default App;

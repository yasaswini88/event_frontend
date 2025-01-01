import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../utils/api';

import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockIcon,
} from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = async (response) => {
    try {
      // Extract the credential from Google's response
      const credential = response.credential;
      
      // Call backend API to verify Google token and get user details
      const backendResponse = await api.post('/api/google-login', {
        credential: credential
      });
  
      // Handle successful authentication
      if (backendResponse.data) {
        const user = backendResponse.data;
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Logged-in User Details:', user);
  
        // Navigate to home page
        navigate('/proposal');
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      // Handle specific error cases
      if (error.response) {
        switch (error.response.status) {
          case 404:
            setError('User not found. Please register first.');
            break;
          case 401:
            setError('Invalid credentials.');
            break;
          default:
            setError('An error occurred during login. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };
  


  const handleLoginFailure = (error) => {
    console.log('Login Failed:', error);
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/login', { email, password });
      setIsLoading(false);

      if (response.data) {
        const user = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Logged-in User Details:', user);

       
       
        if (user.roles.roleName === 'Approver') {
          navigate('/approver-dashboard');
        } else if (user.roles.roleName === 'Admin' || user.roles.roleName === 'Faculty') {
          navigate('/proposal');
        } else if (user.roles.roleName === 'Purchaser') {
          navigate('/purchaser-dashboard');
        } else {
          navigate('/proposal');
        }
        
      }
    } catch (error) {
      setIsLoading(false);
      setError('Invalid email or password');
    }
  };

  return (
    <GoogleOAuthProvider clientId="475963270470-8t95utndvds4sqjjcup7bmeca0ld8o7e.apps.googleusercontent.com">
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#e8dede',
          py: 12,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={4}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
            }}
          >
          
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: '#6c63ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <LockIcon sx={{ color: 'white' }} />
            </Box>

            <Typography
              component="h1"
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Sign in
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  mb: 1,
                  bgcolor: '#6c63ff',
                  '&:hover': {
                    bgcolor: '#5848d9',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                

                
              </Box>
            </Box>

            <Typography
              component="h2"
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, mt: 1 }}
            >
              Or
            </Typography>

            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onFailure={handleLoginFailure}
              cookiePolicy={'single_host_origin'}
            />
          </Paper>
        </Container>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;

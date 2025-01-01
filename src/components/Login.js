import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';

import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import useEffect from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useMediaQuery, useTheme
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockIcon,
} from '@mui/icons-material';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const error = useSelector(state => state.auth.error);
  const isLoading = useSelector(state => state.auth.loading);

 

  const handleLoginSuccess = async (response) => {
    try {
      dispatch(loginStart());
      const credential = response.credential;

      // Call the backend API
      const backendResponse = await api.post('/api/google-login', {
        credential: credential,
      });

      if (backendResponse.data) {
        const user = backendResponse.data;
        console.log('Google Login User:', user);
        // Save user details in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(loginSuccess(user));

        console.log('User roleId is:', user.roleId);
        switch (user.roles?.roleId) {
          case 1: // Administrator
            window.location.href = '/admin-dashboard';
            break;
          case 3: // Approver
            navigate('/approver-dashboard');
            break;
          case 4: // Purchaser
            navigate('/purchaser-dashboard');
            break;
          default:
            navigate('/proposal');
            break;
        }



      }
    } catch (error) {
      console.error('Google Login Error:', error);
      let errorMessage = 'An error occurred during login. Please try again.';

      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = 'User not found. Please register first.';
            break;
          case 401:
            errorMessage = 'Invalid credentials.';
            break;
          default:
            errorMessage = 'An error occurred during login. Please try again.';
        }
      } else {
        errorMessage = 'Network error. Please check your connection.';
      }
      dispatch(loginFailure(errorMessage));
    }
  };


  const handleLoginFailure = (error) => {
    console.log('Login Failed:', error);
    dispatch(loginFailure('Google login failed'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await api.post('/api/login', { email, password });

      if (response.data) {
        const { token, user } = response.data;
        localStorage.setItem('token', token); // store just the token
        localStorage.setItem('user', JSON.stringify(user)); // store just user object
        dispatch(loginSuccess({ user, token }));


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
      }
    } catch (error) {
      dispatch(loginFailure('Invalid email or password'));
    }
  };



  return (
    <GoogleOAuthProvider clientId="475963270470-8t95utndvds4sqjjcup7bmeca0ld8o7e.apps.googleusercontent.com">
      {/* <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#e8dede',
          py: 12,
          px: 2,
        }}
      > */}
      <Container
        maxWidth="sm"
        sx={{
          maxHeight: '90vh', // Limit height to viewport
          overflowY: 'auto', // Add scrolling for overflow
        }}
      >
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

    </GoogleOAuthProvider>
  );
};

export default Login;
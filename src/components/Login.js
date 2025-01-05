import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';

import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
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

  const error = useSelector((state) => state.auth.error);
  const isLoading = useSelector((state) => state.auth.loading);

  const handleLoginSuccess = async (response) => {
    // handleLoginSuccess for Google
try {
  dispatch(loginStart());
  const credential = googleResponse.credential;
  const backendResponse = await api.post('/api/google-login', { credential });

  if (backendResponse.data && backendResponse.data.token) {
    const token = backendResponse.data.token;
    localStorage.setItem('token', token);

    // decode
    const userDetailsResponse = await api.get('/api/decode-token');
    if (userDetailsResponse.data) {
      const { userId, roleId, firstName, lastName, email } = userDetailsResponse.data;
      dispatch(loginSuccess({ token, userId, roleId, firstName, lastName, email }));

      // navigate
      switch (roleId) {
        case 1: navigate('/admin-dashboard'); break;
        case 3: navigate('/approver-dashboard'); break;
        case 4: navigate('/purchaser-dashboard'); break;
        default: navigate('/proposal');
      }
    }
  }
} catch (error) {
  dispatch(loginFailure('Google login failed'));
}

  };

  const handleLoginFailure = (error) => {
    console.log('Login Failed:', error);
    dispatch(loginFailure('Google login failed'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    // handleSubmit for email/password
try {
  const response = await api.post('/api/login', { email, password });

  if (response.data && response.data.token) {
    const { token } = response.data;

    // Store the token
    localStorage.setItem('token', token);

    // Call decode-token to get user details
    const userDetailsResponse = await api.get('/api/decode-token', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (userDetailsResponse.data) {
      const { userId, roleId, firstName, lastName, email } = userDetailsResponse.data;

      // Dispatch to Redux
      dispatch(
        loginSuccess({
          token,
          userId,
          roleId,              // numeric role
          firstName,
          lastName,
          email
        })
      );

      // Navigate based on roleId
      switch (roleId) {
        case 1: // Admin
          navigate('/admin-dashboard');
          break;
        case 3: // Approver
          navigate('/approver-dashboard');
          break;
        case 4: // Purchaser
          navigate('/purchaser-dashboard');
          break;
        default: // e.g. roleId=2 (Faculty)
          navigate('/proposal');
      }
    } else {
      dispatch(loginFailure('Invalid user details'));
    }
  } else {
    dispatch(loginFailure('Invalid credentials'));
  }
} catch (error) {
  console.error('Login error:', error);
  dispatch(loginFailure('An error occurred. Please try again.'));
}

  };

  return (
    <GoogleOAuthProvider clientId="475963270470-8t95utndvds4sqjjcup7bmeca0ld8o7e.apps.googleusercontent.com">
      <Container
        maxWidth="sm"
        sx={{
          maxHeight: '90vh',
          overflowY: 'auto',
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

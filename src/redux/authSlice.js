import { createSlice } from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode'; 

// Initial state
const initialState = {
  token: localStorage.getItem('token') || null,
  userId: null,
  role: null,
  isAuthenticated: !!localStorage.getItem('token'),
  error: null,
  loading: false,
};

// Decode token if available and extract userId and role
if (initialState.token) {
  try {
    const decodedToken = jwt_decode(initialState.token);
    initialState.userId = decodedToken.userId || null;
    initialState.role = decodedToken.role || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token'); // Clear invalid token
    initialState.token = null;
    initialState.isAuthenticated = false;
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, userId, role } = action.payload;
      state.loading = false;
      state.token = token;
      state.userId = userId;
      state.role = role;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('token', token); // Persist token in localStorage
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      localStorage.removeItem('token'); // Clear token from localStorage
      state.token = null;
      state.userId = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

// Selectors
export const selectToken = (state) => state.auth.token;
export const selectUserId = (state) => state.auth.userId;
export const selectRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;

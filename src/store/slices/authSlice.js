import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('vyntrox_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }
      
      // Store token and user in localStorage
      localStorage.setItem('vyntrox_token', data.token);
      localStorage.setItem('vyntrox_user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('vyntrox_token');
      if (!token) return null;
      
      const userStr = localStorage.getItem('vyntrox_user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      // Clear localStorage
      localStorage.removeItem('vyntrox_token');
      localStorage.removeItem('vyntrox_user');
      
      return data;
    } catch (error) {
      // Even if API call fails, clear localStorage
      localStorage.removeItem('vyntrox_token');
      localStorage.removeItem('vyntrox_user');
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Get stored user from localStorage
const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('vyntrox_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStoredUser(),
    token: localStorage.getItem('vyntrox_token') || null,
    isAuthenticated: !!localStorage.getItem('vyntrox_token'),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('vyntrox_token');
      localStorage.removeItem('vyntrox_user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

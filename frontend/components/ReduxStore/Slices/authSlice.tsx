import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Keychain from 'react-native-keychain';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });

      // Extract authToken and refreshToken
      const { authToken, refreshToken, data } = response.data;
      // Destructure user data
      const {
        firstName,
        lastName,
        dob,
        gender,
        role,
        userId,
        profileComplete
      } = data;

      try {
        await Keychain.setGenericPassword(authToken, refreshToken);
      } catch (keychainError) {
        console.error('Failed to save to Keychain:', keychainError);
      }

      // Return user data including tokens
      return {
        user: {
          username,
          firstName,
          lastName,
          dob,
          gender,
          role,
          userId,
          profileComplete
        },
        authToken,
        refreshToken
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const credentials = await Keychain.getInternetCredentials(
        'refreshTokenService'
      );
      if (!credentials) {
        throw new Error('No refresh token found');
      }
      const response = await axios.post(`${API_URL}/refresh-token`, {
        refreshToken: credentials.password
      });
      await Keychain.setGenericPassword(
        'accessToken',
        response.data.accessToken
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'An error occurred' }
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      // Clear Keychain credentials
      Keychain.resetGenericPassword();
      Keychain.resetInternetCredentials('refreshTokenService');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

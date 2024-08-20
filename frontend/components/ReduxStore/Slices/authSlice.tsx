import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
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
      const { data } = response.data;
      // Destructure user data
      const {
        firstName,
        lastName,
        dob,
        gender,
        role,
        userId,
        profileComplete,
        authToken,
        refreshToken
      } = data;

      const credentials = { authToken, refreshToken };
      const credentialsString = JSON.stringify(credentials);
      try {
        await SecureStore.setItemAsync('auth', credentialsString);
      } catch (error) {
        console.error('Failed to save to Keychain:', error);
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

export const signup = createAsyncThunk(
  'auth/signup',
  async (
    { username, password, firstName, lastName, dob, gender },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        password,
        firstName,
        lastName,
        ...(dob && { dob }), // Include dob only if it's provided
        ...(gender && { gender }) // Include gender only if it's provided
      });

      // Extract authToken and refreshToken
      const { data } = response.data;
      console.log('data', data);
      // Destructure user data
      const {
        firstName: returnedFirstName,
        lastName: returnedLastName,
        dob: returnedDob,
        gender: returnedGender,
        role,
        userId,
        profileComplete,
        authToken,
        refreshToken
      } = data;

      const credentials = { authToken, refreshToken };
      const credentialsString = JSON.stringify(credentials);
      try {
        await SecureStore.setItemAsync('auth', credentialsString);
      } catch (error) {
        console.error('Failed to save to Keychain:', error);
      }

      // Return user data including tokens
      return {
        user: {
          username,
          firstName: returnedFirstName,
          lastName: returnedLastName,
          dob: returnedDob,
          gender: returnedGender,
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
      const storedCredentials = await SecureStore.getItemAsync('auth');
      if (!storedCredentials) {
        throw new Error('No refresh token found');
      }

      const { refreshToken } = JSON.parse(storedCredentials);

      const response = await axios.post(`${API_URL}/refresh`, {
        refreshToken
      });

      const { authToken: newAuthToken, refreshToken: newRefreshToken } =
        response.data;

      const newCredentials = {
        authToken: newAuthToken,
        refreshToken: newRefreshToken
      };
      const newCredentialsString = JSON.stringify(newCredentials);

      try {
        await SecureStore.setItemAsync('auth', newCredentialsString);
      } catch (error) {
        console.error('Failed to save to SecureStore:', error);
      }

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
      SecureStore.deleteItemAsync('auth').catch((error) =>
        console.error('Failed to clear SecureStore:', error)
      );
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
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(signup.rejected, (state, action) => {
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

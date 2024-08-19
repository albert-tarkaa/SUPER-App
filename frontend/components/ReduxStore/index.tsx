import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slices/authSlice';
import locationReducer from './Slices/locationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer
  }
});

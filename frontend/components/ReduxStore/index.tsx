import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slices/authSlice';
import locationReducer from './Slices/locationSlice';
import parkDetailsReducer from './Slices/parkDetailsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    parkDetails: parkDetailsReducer
  }
});

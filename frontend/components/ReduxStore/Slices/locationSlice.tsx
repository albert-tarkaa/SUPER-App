import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import { update } from 'lodash';

export const getUserLocation = createAsyncThunk(
  'location/getUserLocation',
  async (_, { rejectWithValue }) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return rejectWithValue('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      return location.coords;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    latitude: null,
    longitude: null,
    destinationLatitude: null,
    destinationLongitude: null,
    isLoading: false,
    error: null
  },
  reducers: {
    updateUserLocation: (state, action) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
    },
    updateDestinationLocation: (state, action) => {
      state.destinationLatitude = action.payload.destinationLatitude;
      state.destinationLongitude = action.payload.destinationLongitude;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.latitude = action.payload.latitude;
        state.longitude = action.payload.longitude;
      })
      .addCase(getUserLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { updateUserLocation, updateDestinationLocation } =
  locationSlice.actions;
export default locationSlice.reducer;

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as Location from 'expo-location';

export const getUserLocation = createAsyncThunk('location/getUserLocation', async (_, { rejectWithValue }) => {
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
});

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
    setDestinationLocation: (state, action) => {
      state.destinationLatitude = action.payload.latitude;
      state.destinationLongitude = action.payload.longitude;
    },
    clearDestinationLocation: (state) => {
      state.destinationLatitude = null;
      state.destinationLongitude = null;
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

export const { updateUserLocation, setDestinationLocation, clearDestinationLocation } = locationSlice.actions;
export default locationSlice.reducer;

// Selector to get the destination location
const selectLocation = (state) => state.location;

export const getDestinationLocation = createSelector([selectLocation], (location) => ({
  latitude: location.destinationLatitude,
  longitude: location.destinationLongitude
}));

// Selector to get the user's current location
export const getUserLocationSelector = (state) => ({
  latitude: state.location.latitude,
  longitude: state.location.longitude
});

// To fetch the user's location: dispatch(getUserLocation())
// To manually update the user's location: dispatch(updateUserLocation({ latitude, longitude }))
// To set the destination: dispatch(setDestinationLocation({ latitude, longitude }))
// To clear the destination: dispatch(clearDestinationLocation())
// To get the user's location: const userLocation = useSelector(getUserLocationSelector)
// To get the destination location: const destination = useSelector(getDestinationLocation)

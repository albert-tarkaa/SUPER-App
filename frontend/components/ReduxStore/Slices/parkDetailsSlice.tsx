import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  parkDetails: null,
  isLoading: false,
  error: null
};

const parkDetailsSlice = createSlice({
  name: 'parkDetails',
  initialState,
  reducers: {
    setParkDetails: (state, action) => {
      state.parkDetails = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setParkDetailsLoading: (state) => {
      state.isLoading = true;
    },
    setParkDetailsError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    }
  }
});

export const { setParkDetails, setParkDetailsLoading, setParkDetailsError } = parkDetailsSlice.actions;

export default parkDetailsSlice.reducer;

import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { store } from '../ReduxStore';
import { refreshToken, logout } from '../ReduxStore/Slices/authSlice';

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = await Keychain.getGenericPassword();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken.password}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await store.dispatch(refreshToken());
        const newAccessToken = await Keychain.getGenericPassword();
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken.password}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  requestRegistrationOtp: async ({ name, email }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register/request-otp', { name, email });
      set({ isLoading: false });
      return { success: true, data: data.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Could not send OTP';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  verifyRegistrationOtp: async ({ email, otp }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register/verify-otp', { email, otp });
      set({ isLoading: false });
      return { success: true, verificationToken: data.data.verificationToken };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'OTP verification failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  register: async ({ email, password, verificationToken }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { email, password, verificationToken });
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        sessionStorage.removeItem('hasSeenWelcome');
        set({ user: data.data.user, isAuthenticated: true, isLoading: false });
        return { success: true, user: data.data.user };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
    set({ isLoading: false });
    return { success: false, message: 'Registration failed' };
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        sessionStorage.removeItem('hasSeenWelcome');
        set({ user: data.data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('hasSeenWelcome');
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

import api from './api';

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    email: string;
    name: string;
  };
}

// Register a new user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

// Login user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Refresh access token
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

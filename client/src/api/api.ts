// client/src/api/api.ts
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
});

let accessToken: string | null = null;

// Axios request interceptor: Attach access token to headers
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
    }
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Axios response interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If the error is due to an expired access token
    if ([401, 403].includes(error.response?.status) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const { data } = await axios.post(`/api/auth/refresh`, {
          refreshToken: localStorage.getItem('refreshToken'),
        });
        
        const accessToken = data.data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry the original request with the new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

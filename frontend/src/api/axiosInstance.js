import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let currentAccessToken = null;
let logoutHandler = null;
let onAccessTokenRefreshed = null;

export function setAccessToken(token) {
  currentAccessToken = token;
}

export function setLogoutHandler(fn) {
  logoutHandler = fn;
}

export function setOnAccessTokenRefreshed(fn) {
  onAccessTokenRefreshed = fn;
}

api.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error?.response?.status;
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');

    if (status === 401 && originalRequest && !originalRequest._retry && !isRefreshEndpoint) {
      originalRequest._retry = true;

      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        if (logoutHandler) logoutHandler();
        return Promise.reject(error);
      }

      if (!refreshPromise) {
        refreshPromise = api
          .post('/auth/refresh', { refreshToken: storedRefreshToken })
          .then((res) => {
            const payload = res?.data?.data || res?.data;
            const newAccessToken = payload?.accessToken;
            const newRefreshToken = payload?.refreshToken;

            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            if (newAccessToken) {
              currentAccessToken = newAccessToken;
              if (onAccessTokenRefreshed) onAccessTokenRefreshed(newAccessToken);
            }
            return newAccessToken;
          })
          .catch((refreshErr) => {
            if (logoutHandler) logoutHandler();
            throw refreshErr;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        return api(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;


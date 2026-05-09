import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
  } from 'react';
  
  import { useNavigate } from 'react-router-dom';
  
  import { authApi } from '../api/authApi';
  
  import api, {
    setAccessToken,
    setLogoutHandler,
    setOnAccessTokenRefreshed,
  } from '../api/axiosInstance';
  
  export const AuthContext = createContext(null);
  
  function parseApiError(err) {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Something went wrong'
    );
  }
  
  export function AuthProvider({ children }) {
    const navigate = useNavigate();
  
    const [user, setUser] = useState(null);
    const [accessToken, setAccessTokenState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const logout = useCallback(async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
  
        if (refreshToken && accessToken) {
          await authApi.logout(refreshToken);
        }
      } catch {
        // ignore logout errors
      } finally {
        localStorage.removeItem('refreshToken');
  
        setUser(null);
        setAccessTokenState(null);
        setAccessToken(null);
  
        navigate('/login', { replace: true });
      }
    }, [accessToken, navigate]);
  
    useEffect(() => {
      setLogoutHandler(() => logout);
  
      setOnAccessTokenRefreshed((token) => {
        setAccessTokenState(token);
      });
    }, [logout]);
  
    const register = useCallback(async (name, email, password) => {
      const res = await authApi.register({
        name,
        email,
        password,
      });
  
      const payload = res?.data?.data || res?.data;
  
      localStorage.setItem('refreshToken', payload.refreshToken);
  
      setUser(payload.user);
  
      setAccessTokenState(payload.accessToken);
  
      setAccessToken(payload.accessToken);
  
      return payload.user;
    }, []);
  
    const login = useCallback(async (email, password) => {
      const res = await authApi.login({
        email,
        password,
      });
  
      const payload = res?.data?.data || res?.data;
  
      localStorage.setItem('refreshToken', payload.refreshToken);
  
      setUser(payload.user);
  
      setAccessTokenState(payload.accessToken);
  
      setAccessToken(payload.accessToken);
  
      return payload.user;
    }, []);
  
    useEffect(() => {
      let isMounted = true;
  
      async function restoreSession() {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
  
          if (!refreshToken) return;
  
          const res = await authApi.refresh(refreshToken);
  
          const payload = res?.data?.data || res?.data;
  
          localStorage.setItem(
            'refreshToken',
            payload.refreshToken
          );
  
          if (!isMounted) return;
  
          setAccessTokenState(payload.accessToken);
  
          setAccessToken(payload.accessToken);
  
          const meRes = await api.get('/users/me');
  
          const mePayload =
            meRes?.data?.data || meRes?.data;
  
          if (!isMounted) return;
  
          setUser(mePayload);
        } catch {
          localStorage.removeItem('refreshToken');
        }
      }
  
      Promise.resolve()
        .then(restoreSession)
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
  
      return () => {
        isMounted = false;
      };
    }, []);
  
    const value = useMemo(
      () => ({
        user,
  
        accessToken,
  
        isLoading,
  
        login: async (email, password) => {
          try {
            const u = await login(email, password);
  
            return {
              user: u,
              error: null,
            };
          } catch (err) {
            return {
              user: null,
              error: parseApiError(err),
            };
          }
        },
  
        register: async (name, email, password) => {
          try {
            const u = await register(
              name,
              email,
              password
            );
  
            return {
              user: u,
              error: null,
            };
          } catch (err) {
            return {
              user: null,
              error: parseApiError(err),
            };
          }
        },
  
        logout,
      }),
      [
        user,
        accessToken,
        isLoading,
        login,
        register,
        logout,
      ]
    );
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const ctx = useContext(AuthContext);
  
    if (!ctx) {
      throw new Error(
        'useAuth must be used within AuthProvider'
      );
    }
  
    return ctx;
  }
  
  export default AuthContext;
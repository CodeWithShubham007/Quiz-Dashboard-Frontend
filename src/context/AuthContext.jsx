import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (role, payload) => {
    const endpoint = role === 'admin'
      ? '/auth/admin/login'
      : role === 'student'
        ? '/auth/student/login'
        : '/auth/faculty/login';
    const { data } = await api.post(endpoint, payload);
    setUser(data.user);
    return data;
  };

  const register = async (role, payload) => {
    const endpoint = role === 'student' ? '/auth/student/register' : '/auth/faculty/register';
    const { data } = await api.post(endpoint, payload);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

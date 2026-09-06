import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mia_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setLoading(false);
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const response = await axios.get(`${API}/api/auth/me`);

        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(response.data);
        }
      } catch (error) {
        console.error('SESSION RESTORE ERROR:', error);
        localStorage.removeItem('mia_token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  const login = async (email, password, twoFactorCode = '', recoveryCode = '') => {
    const res = await axios.post(`${API}/api/auth/login`, {
      email,
      password,
      ...(twoFactorCode ? { twoFactorCode } : {}),
      ...(recoveryCode ? { recoveryCode } : {})
    });

    const { token, user } = res.data;

    localStorage.setItem('mia_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setToken(token);
    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem('mia_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

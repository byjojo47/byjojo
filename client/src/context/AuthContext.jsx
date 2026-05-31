import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useLanguage } from './LanguageContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('byjojoToken'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('byjojoToken');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (values) => {
    const res = await api.post('/auth/login', values);

    localStorage.setItem('byjojoToken', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);

    toast.success(t('welcomeBack'));
    return res.data.user;
  };

  const signup = async (values) => {
    const res = await api.post('/auth/signup', values);

    localStorage.setItem('byjojoToken', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);

    toast.success(t('accountReady'));
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('byjojoToken');
    setToken(null);
    setUser(null);
    toast.success(t('loggedOut'));
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
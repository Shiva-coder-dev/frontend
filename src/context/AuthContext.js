import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fingroup_token');
    if (token) {
      api.get('/auth/me')
        .then(res => { setUser(res.data.user); setMember(res.data.member); })
        .catch(() => { localStorage.removeItem('fingroup_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password, portal) => {
    const res = await api.post('/auth/login', { identifier, password, portal });
    localStorage.setItem('fingroup_token', res.data.token);
    setUser(res.data.user);
    setMember(res.data.member);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('fingroup_token');
    setUser(null);
    setMember(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, member, loading, login, logout, setMember }}>
      {children}
    </AuthContext.Provider>
  );
};

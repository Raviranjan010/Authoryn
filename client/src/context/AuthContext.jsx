import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      // If we don't have token in localStorage, we can still let the cookie try to authenticate
      try {
        const response = await api.get('/api/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          if (response.data.token && !token) {
            localStorage.setItem('token', response.data.token);
            setToken(response.data.token);
          }
        } else {
          handleLocalLogout();
        }
      } catch (error) {
        console.error('Verify token failed:', error);
        handleLocalLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password, rememberMe) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
      rememberMe
    });

    if (response.data.success) {
      const newToken = response.data.token;
      const newUser = response.data.user;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      return response.data;
    }
  };

  const register = async (name, email, username, password) => {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      username,
      password
    });

    if (response.data.success) {
      const newToken = response.data.token;
      const newUser = response.data.user;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      return response.data;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('API logout failed:', err);
    } finally {
      handleLocalLogout();
    }
  };

  const handleLocalLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

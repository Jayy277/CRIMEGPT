import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on load
    const storedToken = localStorage.getItem('crimegpt_token');
    const storedUser = localStorage.getItem('crimegpt_user');
    const storedDetails = localStorage.getItem('crimegpt_details');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedDetails) {
        setDetails(JSON.parse(storedDetails));
      }
    }
    setLoading(false);
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        usernameOrEmail,
        password,
      });

      const { token: jwtToken, user: userData, details: userDetails } = response.data;

      // Save to state
      setToken(jwtToken);
      setUser(userData);
      setDetails(userDetails);

      // Save to localStorage
      localStorage.setItem('crimegpt_token', jwtToken);
      localStorage.setItem('crimegpt_user', JSON.stringify(userData));
      if (userDetails) {
        localStorage.setItem('crimegpt_details', JSON.stringify(userDetails));
      } else {
        localStorage.removeItem('crimegpt_details');
      }

      return { success: true, role: userData.role };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setDetails(null);
    localStorage.removeItem('crimegpt_token');
    localStorage.removeItem('crimegpt_user');
    localStorage.removeItem('crimegpt_details');
  };

  const refreshProfile = async () => {
    try {
      if (user && user.role !== 'admin') {
        const route = user.role === 'officer' ? '/dashboard/officer' : '/dashboard/analyst';
        const response = await axiosInstance.get(route);
        // If there's new data about the officer/analyst profile, refresh it
        if (response.data && response.data.details) {
          setDetails(response.data.details);
          localStorage.setItem('crimegpt_details', JSON.stringify(response.data.details));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user profile data:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        details,
        loading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

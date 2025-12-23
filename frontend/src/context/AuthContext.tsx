import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/apiService';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;
      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);
    } catch (e) {
      console.error('Login failed', e);
      // You might want to throw the error to handle it in the UI
      throw e;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      // Don't automatically log in after signup
      return response.data;
    } catch (e) {
      console.error('Signup failed', e);
      throw e;
    }
  };

  const logout = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      setIsLoading(false);
    } catch (e) {
      console.log(`isLoggedIn error ${e}`);
    }
  };

  useEffect(() => {
    const clearTokenOnStart = async () => {
      try {
        setIsLoading(true);
        await AsyncStorage.removeItem('userToken');
        setUserToken(null);
      } catch (e) {
        console.error('Failed to clear token', e);
      } finally {
        setIsLoading(false);
      }
    };

    clearTokenOnStart();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, signup, userToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

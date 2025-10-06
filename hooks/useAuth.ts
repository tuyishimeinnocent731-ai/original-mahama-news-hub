import { useState, useEffect, useCallback } from 'react';

const AUTH_TOKEN_KEY = 'authToken';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const login = useCallback((email: string) => {
    // Simulate API call and token generation
    const mockToken = `mock-token-for-${email}`;
    localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
    setIsLoggedIn(true);
  }, []);
  
  const register = useCallback((email: string) => {
    // Simulate user creation and login
    const mockToken = `mock-token-for-new-user-${email}`;
    localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsLoggedIn(false);
  }, []);

  return { isLoggedIn, login, register, logout };
};
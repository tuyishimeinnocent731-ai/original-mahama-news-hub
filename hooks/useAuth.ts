
import { useState, useEffect, useCallback } from 'react';
import { User, SubscriptionPlan } from '../types';

const USER_STORAGE_KEY = 'news_app_user';
const PLAN_STORAGE_KEY = 'news_app_plan';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const storedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedPlan && ['free', 'standard', 'premium'].includes(storedPlan)) {
        setSubscriptionPlan(storedPlan as SubscriptionPlan);
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(PLAN_STORAGE_KEY);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, _password?: string) => {
    // Mock API call
    await new Promise(res => setTimeout(res, 500));
    const userData: User = { email };
    setUser(userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const register = useCallback(async (email: string, _password?: string) => {
     // Mock API call
     await new Promise(res => setTimeout(res, 500));
     const userData: User = { email };
     setUser(userData);
     setSubscriptionPlan('free');
     localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
     localStorage.setItem(PLAN_STORAGE_KEY, 'free');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSubscriptionPlan('free');
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(PLAN_STORAGE_KEY);
  }, []);
  
  const updateSubscriptionPlan = useCallback((plan: SubscriptionPlan) => {
    setSubscriptionPlan(plan);
    localStorage.setItem(PLAN_STORAGE_KEY, plan);
  }, []);


  return {
    user,
    subscriptionPlan,
    isLoading,
    login,
    logout,
    register,
    setSubscriptionPlan: updateSubscriptionPlan
  };
};

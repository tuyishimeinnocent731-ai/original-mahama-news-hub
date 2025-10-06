import { useState, useEffect } from 'react';
import { User, SubscriptionPlan } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const storedPlan = localStorage.getItem('subscriptionPlan') as SubscriptionPlan;
        if (storedPlan) {
          setPlan(storedPlan);
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
        localStorage.removeItem('subscriptionPlan');
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const newUser = { email };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('subscriptionPlan');
    setUser(null);
    setPlan('free');
  };

  const register = (email: string) => {
    login(email);
  };

  const subscribe = (newPlan: SubscriptionPlan) => {
    localStorage.setItem('subscriptionPlan', newPlan);
    setPlan(newPlan);
  };

  return { user, loading, login, logout, register, subscribe, plan };
};

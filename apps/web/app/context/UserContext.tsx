'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface UserContextType {
  userId: string;
  username: string | null;
  isDemo: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (id: string, username?: string) => void;
  logout: () => void;
  initDemo: () => Promise<void>;
  resetDemo: () => Promise<void>;
  clearData: () => Promise<void>;
  register: (username: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user ID
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (storedUserId) {
      setUserId(storedUserId);
      const isGuest = storedUserId.startsWith('guest-');
      setIsDemo(isGuest);
      setIsLoggedIn(storedIsLoggedIn && !isGuest);
      if (storedUsername && storedIsLoggedIn) {
        setUsername(storedUsername);
      }
    } else {
      // Generate new guest ID if no stored ID
      const newGuestId = `guest-${uuidv4()}`;
      setUserId(newGuestId);
      setIsDemo(true);
      setIsLoggedIn(false);
      localStorage.setItem('userId', newGuestId);
    }
    setIsLoading(false);
  }, []);

  const login = (id: string, username?: string) => {
    setUserId(id);
    setIsDemo(id.startsWith('guest-'));
    setIsLoggedIn(!id.startsWith('guest-'));
    localStorage.setItem('userId', id);
    localStorage.setItem('isLoggedIn', (!id.startsWith('guest-')).toString());
    if (username) {
      setUsername(username);
      localStorage.setItem('username', username);
    }
    // Reload to refresh data
    window.location.reload();
  };

  const logout = () => {
    const newGuestId = `guest-${uuidv4()}`;
    setUserId(newGuestId);
    setUsername(null);
    setIsDemo(true);
    setIsLoggedIn(false);
    localStorage.setItem('userId', newGuestId);
    localStorage.removeItem('username');
    localStorage.setItem('isLoggedIn', 'false');
    // Reload to refresh data
    window.location.reload();
  };

  // 初始化演示数据
  const initDemo = async () => {
    if (isDemo && userId) {
      await fetch('/api/demo/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        }
      });
      window.location.reload();
    }
  };

  // 重置演示数据（清空后重新初始化）
  const resetDemo = async () => {
    if (isDemo && userId) {
      // 先清空数据
      await fetch('/api/settings', {
        method: 'DELETE',
        headers: {
          'x-user-id': userId
        }
      });

      // 重新初始化演示数据
      await fetch('/api/demo/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        }
      });

      window.location.reload();
    }
  };

  const clearData = async () => {
    if (userId) {
      await fetch('/api/settings', {
        method: 'DELETE',
        headers: {
          'x-user-id': userId
        }
      });

      window.location.reload();
    }
  };

  const register = async (username: string) => {
    // 注册成功后更新状态
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setUsername(username);
      setIsDemo(false);
      setIsLoggedIn(true);
      localStorage.setItem('username', username);
      localStorage.setItem('isLoggedIn', 'true');
      // Reload to refresh data
      window.location.reload();
    }
  };

  return (
    <UserContext.Provider value={{ userId, username, isDemo, isLoggedIn, isLoading, login, logout, initDemo, resetDemo, clearData, register }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

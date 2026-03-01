'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface UserContextType {
  userId: string;
  isDemo: boolean;
  login: (id: string) => void;
  logout: () => void;
  resetDemo: () => Promise<void>;
  clearData: () => Promise<void>;
  register: (username: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>('');
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for stored user ID
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setIsDemo(storedUserId === 'demo' || storedUserId.startsWith('guest-'));
    } else {
      // Generate new guest ID if no stored ID
      const newGuestId = `guest-${uuidv4()}`;
      setUserId(newGuestId);
      setIsDemo(true);
      localStorage.setItem('userId', newGuestId);
    }
    setIsInitialized(true);
  }, []);

  // Initialize demo data if needed
  useEffect(() => {
    // 只有在初始化完成、是demo用户、有userId且数据为空时才初始化
    if (isInitialized && isDemo && userId) {
      // 检查是否已经有数据，避免清空后被重新初始化
      // 这里通过localStorage标记是否是用户主动清空
      const isCleared = localStorage.getItem(`cleared_${userId}`);
      
      if (!isCleared) {
        fetch('/api/demo/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          }
        }).catch(console.error);
      }
    }
  }, [isInitialized, isDemo, userId]);

  const login = (id: string) => {
    setUserId(id);
    setIsDemo(id === 'demo' || id.startsWith('guest-'));
    localStorage.setItem('userId', id);
    // Reload to refresh data
    window.location.reload();
  };

  const logout = () => {
    const newGuestId = `guest-${uuidv4()}`;
    setUserId(newGuestId);
    setIsDemo(true);
    localStorage.setItem('userId', newGuestId);
    // Reload to refresh data
    window.location.reload();
  };

  const resetDemo = async () => {
    if (isDemo && userId) {
      // 移除清空标记
      localStorage.removeItem(`cleared_${userId}`);
      
      await fetch('/api/demo/reset', {
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
      
      // 标记为已清空，防止重新初始化
      if (isDemo) {
        localStorage.setItem(`cleared_${userId}`, 'true');
      }
      
      window.location.reload();
    }
  };

  const register = async (username: string) => {
    if (!isDemo) return;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        const data = await response.json();
        const newUserId = data.userId;
        setUserId(newUserId);
        setIsDemo(false);
        localStorage.setItem('userId', newUserId);
        // Reload to refresh data
        window.location.reload();
      } else {
        console.error('Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <UserContext.Provider value={{ userId, isDemo, login, logout, resetDemo, clearData, register }}>
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

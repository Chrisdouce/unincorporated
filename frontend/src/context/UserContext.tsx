import React, { createContext, JSX, useContext, useEffect, useState } from "react";

export type UserContextType = {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  login: (token: string, userId: string) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const localStorageToken = localStorage.getItem('token');
    if (!localStorageToken) {
      setIsLoading(false);
      return;
    }
    const localStorageUserId = localStorage.getItem('userId');
    if (!localStorageUserId) {
      setIsLoading(false);
      return;
    }
    setToken(localStorageToken);
    setUserId(localStorageUserId);
    setIsLoading(false);
  }, []);

  function login(token: string, userId: string): void {
    setToken(token);
    setUserId(userId);
    if (token) {
      localStorage.setItem('token', token);
    }
    if (userId) {
      localStorage.setItem('userId', userId);
    }
  }

  function logout(): void {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
  }

  return (
    <UserContext.Provider value={{ token, userId, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('Cannot use useUser outside of UserProvider');
  }
  return context;
}
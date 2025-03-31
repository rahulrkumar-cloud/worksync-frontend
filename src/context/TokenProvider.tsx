"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { parseCookies, destroyCookie } from "nookies";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuth: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookies = parseCookies();
    const storedToken = cookies.token;
    const storedUser = cookies.user ? JSON.parse(cookies.user) : null;

    setToken(storedToken || null);
    setIsAuthenticated(!!storedToken);
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    destroyCookie(null, "token");
    destroyCookie(null, "user");
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <AuthContext.Provider value={{ token, setToken, isAuthenticated, setIsAuthenticated, user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

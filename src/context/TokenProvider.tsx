"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { parseCookies, destroyCookie } from "nookies";

interface AuthContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuth: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookies = parseCookies();
    const storedToken = cookies.token;

    setToken(storedToken || null);
    setIsAuthenticated(!!storedToken);
    setIsLoading(false);
  }, []);

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    destroyCookie(null, "token");
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }


  return (
    <AuthContext.Provider value={{ token, setToken, isAuthenticated, setIsAuthenticated, logout }}>
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

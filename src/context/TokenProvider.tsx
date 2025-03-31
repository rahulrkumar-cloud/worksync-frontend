"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { parseCookies } from "nookies";

interface AuthContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookies = parseCookies();
    const storedToken = cookies.token;

    console.log("🍪 Token from cookies:", storedToken);

    setToken(storedToken || null);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <p>Loading...</p>; // Prevent rendering until token is checked
  }

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useToken must be used within an AuthProvider");
  }
  return context;
};

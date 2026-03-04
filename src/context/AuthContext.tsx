import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to a Guest user for a no-auth experience
  const [user, setUser] = useState<User | null>({
    id: 1,
    name: "Guest User",
    email: "guest@example.com"
  });
  const [token, setToken] = useState<string | null>("guest-token");
  const [loading, setLoading] = useState(false);

  const logout = () => {
    // In no-auth mode, logout might not be needed, but we'll keep it for state consistency
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

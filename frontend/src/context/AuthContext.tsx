import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, LoginPayload, RegisterPayload } from "../types/auth.types";
import * as authService from "../services/auth.service";
import * as userService from "../services/user.service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUserContext: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as User;
          setUser(parsed);
          // Refresh user data from server in background
          if (parsed.id) {
            const fresh = await userService.getUserById(parsed.id);
            const updatedUser: User = {
              id: fresh.id,
              username: fresh.username,
              email: parsed.email,
              avatarUrl: fresh.avatarUrl,
              createdAt: fresh.createdAt,
              updatedAt: fresh.updatedAt,
            };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        } catch {
          // If profile fetch fails or invalid token, keep user or clear
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    localStorage.setItem("accessToken", res.token);
    localStorage.setItem("refreshToken", res.refreshToken);

    const currentUser: User = {
      id: res.userId,
      username: res.username,
      email: res.email,
    };

    setUser(currentUser);
    localStorage.setItem("user", JSON.stringify(currentUser));
  };

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const updateUserContext = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

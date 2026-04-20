"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  signup: (email: string, password: string, name: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Only run on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [isClient]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (password !== "password") throw new Error("Invalid credentials");

      const userData: User = {
        id: "1",
        email,
        name: email === "admin@wedding.com" ? "Admin User" : email.split("@")[0],
        role: email === "admin@wedding.com" ? "admin" : "user",
        avatar:
          "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=150",
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success("Welcome back!");
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const userData: User = {
        id: "2",
        email: "user@gmail.com",
        name: "Google User",
        role: "user",
        avatar:
          "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=150",
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success("Successfully signed in with Google!");
      return userData;
    } catch (error) {
      toast.error("Google sign-in failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userData: User = {
        id: Date.now().toString(),
        email,
        name,
        role: "user",
        avatar:
          "https://images.pexels.com/photos/1024866/pexels-photo-1024866.jpeg?auto=compress&cs=tinysrgb&w=150",
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success("Account created successfully!");
      return userData;
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  const value = { user, loading, login, loginWithGoogle, signup, logout };

  // Only render children once on client to prevent SSR mismatch
  if (!isClient) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

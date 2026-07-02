"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser { email: string; name?: string; id?: string; }
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mistakebook_auth");
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    if (email === "test@example.com" && password === "123456") {
      const u: AuthUser = { email, name: "Test User", id: "local" };
      setUser(u);
      localStorage.setItem("mistakebook_auth", JSON.stringify(u));
      return { success: true };
    }
    try {
      const users = JSON.parse(localStorage.getItem("mistakebook_users") || "[]");
      const found = users.find((u: any) => u.email === email && u.password === password);
      if (found) {
        const u: AuthUser = { email: found.email, name: found.name, id: found.id };
        setUser(u);
        localStorage.setItem("mistakebook_auth", JSON.stringify(u));
        return { success: true };
      }
    } catch {}
    return { success: false, error: "用户名或密码错误" };
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const users = JSON.parse(localStorage.getItem("mistakebook_users") || "[]");
      if (users.find((u: any) => u.email === email)) {
        return { success: false, error: "用户已存在" };
      }
      users.push({ email, password, name, id: "local_" + Date.now() });
      localStorage.setItem("mistakebook_users", JSON.stringify(users));
      return { success: true };
    } catch {
      return { success: false, error: "注册失败" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mistakebook_auth");
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

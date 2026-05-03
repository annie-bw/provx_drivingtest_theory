import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserProfile } from "../types";
import {
  login as loginApi,
  register as registerApi,
  AuthData,
} from "../api/auth";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<UserProfile>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function buildUser(auth: AuthData): UserProfile {
  const role = auth.role.toLowerCase() as UserProfile["role"];
  return {
    id: auth.userId,
    name: `${auth.firstName} ${auth.lastName}`,
    email: auth.email,
    role,
    token: auth.token,
    practiceCompleted: 0,
    examHistory: [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("provx-user");
    const storedToken = localStorage.getItem("provx-token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const saveAuth = (userData: UserProfile, tokenValue: string) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem("provx-user", JSON.stringify(userData));
    localStorage.setItem("provx-token", tokenValue);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("provx-user");
    localStorage.removeItem("provx-token");
    sessionStorage.removeItem("provx-current-exam-id");
    sessionStorage.removeItem("provx-current-practice-id");
    sessionStorage.removeItem("provx-current-practice-index");
    sessionStorage.removeItem("provx-current-practice-score");
  };

  const login = async (email: string, password: string) => {
    const auth = await loginApi(email, password);
    const userData = buildUser(auth);
    saveAuth(userData, auth.token);
    return userData;
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => {
    const auth = await registerApi(firstName, lastName, email, password);
    const userData = buildUser(auth);
    saveAuth(userData, auth.token);
    return userData;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout: clearAuth,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/client";
import type { LoginResponse, User } from "../types";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./authContext";

const readStoredUser = () => {
  const raw = localStorage.getItem("demo_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("demo_token"));

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      async login(username, password): Promise<LoginResponse> {
        const result = await api.login(username, password);
        localStorage.setItem("demo_token", result.token);
        localStorage.setItem("demo_user", JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
        return result;
      },
      logout() {
        localStorage.removeItem("demo_token");
        localStorage.removeItem("demo_user");
        setToken(null);
        setUser(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

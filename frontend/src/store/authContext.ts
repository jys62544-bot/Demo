import { createContext } from "react";
import type { LoginResponse, User } from "../types";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

import { createContext, useContext} from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import type {LoginPayload, RegisterPayload, AuthResponse} from "../types/index";
import {useLocalStorage} from "../hooks/useLocalStorage";

interface AuthContextType {
    token: string
    isAuthenticated: boolean
    login: (payload: LoginPayload) => Promise<void>
    register: (payload: RegisterPayload) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useLocalStorage("token", "");

    const login = async (payload: LoginPayload) => {
        const {data} = await api.post<AuthResponse>("/auth/login", payload);
        setToken(data.token);
    }

    const register = async (payload: RegisterPayload) => {
        const {data} = await api.post<AuthResponse>("/auth/register", payload);
        setToken(data.token);
    }

    const logout = () => {
        setToken("");
    }

    return (
        <AuthContext.Provider value= {{ token, isAuthenticated: !!token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
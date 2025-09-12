'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
    user: string | null;
    token: string | null;
    login: (email: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            setUser(email);
            setToken(data.token);
            console.log("Login successful");

        } catch (error) {
            console.error("Login error:", error);
        }

    }
    const logout = () => {
        setUser(null);
        setToken(null);
    };

    const value = { user, token, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const useAuth = useContext(AuthContext);
    if(!useAuth) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return useAuth;
}
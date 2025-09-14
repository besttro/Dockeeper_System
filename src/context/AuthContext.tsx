'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type AuthContextType = {
    user: string | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const isAuthenticated = !!token;

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
            localStorage.setItem('token', data.token);

        } catch (error) {
            console.error("Login error:", error);
        }

    }
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, [])

    const value = { user, token, isAuthenticated,login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const useAuth = useContext(AuthContext);
    if(!useAuth) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return useAuth;
}
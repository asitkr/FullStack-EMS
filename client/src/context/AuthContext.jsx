import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [loading, setLoading] = useState(true);

    const refreshSession = async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/auth/session');
            setUser(data.user);
        } catch {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    }

    // Restore session on app load
    useEffect(() => {
        async function loadSession() {
            await refreshSession();
        }

        loadSession();
    }, []);

    const login = async (email, password, role_type) => {
        try {
            const { data } = await api.post("/auth/login", {
                email,
                password,
                role_type,
            });

            localStorage.setItem("token", data.token);

            setToken(data.token);
            setUser(data.user);

            return data;
        } catch (err) {
            throw err.response?.data || err;
        }
    };

    const logout = async () => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    const value = {
        user, 
        token, 
        loading, 
        login, 
        logout, 
        refreshSession
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
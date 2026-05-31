import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMe, login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await getMe();
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('access_token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        const response = await loginApi(email, password);
        const { access_token, user } = response.data;
        localStorage.setItem('access_token', access_token);
        setUser(user);
        return user;
    };

    const register = async (email, password, fullName) => {
        const response = await registerApi(email, password, fullName);
        const { access_token, user } = response.data;
        localStorage.setItem('access_token', access_token);
        setUser(user);
        return user;
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole] = useState(localStorage.getItem('role') || 'user');

    const login = (userData, authToken, userRole) => {
        setUser(userData);
        setToken(authToken);
        setRole(userRole || 'user');
        localStorage.setItem('token', authToken);
        localStorage.setItem('role', userRole || 'user');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole('user');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    };

    return (
        <AuthContext.Provider value={{ user, token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
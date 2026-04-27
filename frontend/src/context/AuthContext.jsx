import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Configure global axios defaults
axios.defaults.baseURL = 'http://localhost:5173'; // Vite Proxy handles the rest
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const csrf = () => axios.get('/sanctum/csrf-cookie');

    const getUser = async () => {
        try {
            const { data } = await axios.get('/api/user');
            setUser(data);
        } catch (e) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async ({ email, password }) => {
        await csrf();
        try {
            await axios.post('/api/login', { email, password });
            await getUser();
            navigate('/');
        } catch (e) {
            throw e;
        }
    };

    const register = async ({ name, email, password, password_confirmation }) => {
        await csrf();
        try {
            await axios.post('/api/register', { name, email, password, password_confirmation });
            await getUser();
            navigate('/');
        } catch (e) {
            throw e;
        }
    };

    const logout = async () => {
        await axios.post('/api/logout');
        setUser(null);
        navigate('/login');
    };

    useEffect(() => {
        // Initial check
        getUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen bg-dark-bg text-white">
                    Loading...
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

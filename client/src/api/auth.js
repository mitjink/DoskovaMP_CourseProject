import api from './axios';

export const register = (email, password, fullName) => {
    return api.post('/auth/register', { email, password, fullName });
};

export const login = (email, password) => {
    return api.post('/auth/login', { email, password });
};

export const logout = () => {
    return api.post('/auth/logout');
};

export const getMe = () => {
    return api.get('/auth/me');
};
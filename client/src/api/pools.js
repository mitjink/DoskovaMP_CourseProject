import api from './axios';

export const getPools = () => {
    return api.get('/pools');
};

export const getPoolById = (id) => {
    return api.get(`/pools/${id}`);
};

export const createPool = (data) => {
    return api.post('/pools', data);
};

export const updatePool = (id, data) => {
    return api.patch(`/pools/${id}`, data);
};

export const deletePool = (id) => {
    return api.delete(`/pools/${id}`);
};
import api from './axios';

export const getCoaches = () => {
    return api.get('/coaches');
};

export const getCoachById = (id) => {
    return api.get(`/coaches/${id}`);
};

export const getCoachesByPool = (poolId) => {
    return api.get(`/coaches/pool/${poolId}`);
};

export const createCoach = (data) => {
    return api.post('/coaches', data);
};

export const updateCoach = (id, data) => {
    return api.patch(`/coaches/${id}`, data);
};

export const deleteCoach = (id) => {
    return api.delete(`/coaches/${id}`);
};
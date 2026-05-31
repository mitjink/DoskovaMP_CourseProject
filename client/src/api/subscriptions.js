import api from './axios';

export const getPasses = () => {
    return api.get('/subscriptions');
};

export const getPassById = (id) => {
    return api.get(`/subscriptions/${id}`);
};

export const createPass = (data) => {
    return api.post('/subscriptions', data);
};

export const updatePass = (id, data) => {
    return api.put(`/subscriptions/${id}`, data);
};

export const deletePass = (id) => {
    return api.delete(`/subscriptions/${id}`);
};

// Покупки клиента
export const getMySubscriptions = () => {
    return api.get('/subscriptions/my');
};

export const buySubscription = (passId, groupId) => {
    return api.post('/subscriptions/buy', { passId, groupId });
};
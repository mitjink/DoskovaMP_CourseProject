import api from './axios';

export const getGroups = () => {
    return api.get('/groups');
};

export const getGroupById = (id) => {
    return api.get(`/groups/${id}`);
};

export const getGroupsByPool = (poolId) => {
    return api.get(`/groups/pool/${poolId}`);
};

export const createGroup = (data) => {
    return api.post('/groups', data);
};

export const updateGroup = (id, data) => {
    return api.patch(`/groups/${id}`, data);
};

export const deleteGroup = (id) => {
    return api.delete(`/groups/${id}`);
};
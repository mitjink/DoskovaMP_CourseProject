import api from './axios';

export const getCoachesByPoolReport = () => {
    return api.get('/reports/coaches-by-pool');
};

export const getProfitByCoachReport = () => {
    return api.get('/reports/profit-by-coach');
};

export const getCoachesWithBeginnersReport = () => {
    return api.get('/reports/coaches-with-beginners');
};

export const getVisitorsByCoachReport = (coachId) => {
    return api.get(`/reports/visitors-by-coach/${coachId}`);
};

export const getGroupsByDayReport = () => {
    return api.get('/reports/groups-by-day');
};

export const getPoolWithMaxRevenueReport = () => {
    return api.get('/reports/pool-with-max-revenue');
};
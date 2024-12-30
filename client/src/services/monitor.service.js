import request from '../utils/request';

export const getSystemOverview = (timeRange) => {
    return request.get('/api/monitor/overview', {
        params: { timeRange }
    });
};

export const getPerformanceMetrics = (type, timeRange) => {
    return request.get('/api/monitor/metrics', {
        params: { type, timeRange }
    });
};

export const getAlerts = ({ status, page, limit }) => {
    return request.get('/api/monitor/alerts', {
        params: { status, page, limit }
    });
};

export const updateAlertStatus = (alertId, status) => {
    return request.put(`/api/monitor/alerts/${alertId}/status`, { status });
};

export const getSystemLogs = ({ level, startTime, endTime, page, limit }) => {
    return request.get('/api/monitor/logs', {
        params: { level, startTime, endTime, page, limit }
    });
};

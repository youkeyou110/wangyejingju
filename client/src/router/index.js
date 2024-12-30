import Dashboard from '../components/monitor/Dashboard';

const routes = [
    // ... 其他路由
    {
        path: '/monitor',
        component: Dashboard,
        meta: {
            requiresAuth: true,
            requiresAdmin: true
        }
    }
];

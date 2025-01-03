import { lazyLoad } from '../components/LazyComponent';

// 懒加载组件
const TextEditor = lazyLoad(() => import('../components/TextEditor'));
const TemplateSelector = lazyLoad(() => import('../components/TemplateSelector'));
const StyleEditor = lazyLoad(() => import('../components/StyleEditor'));
const Preview = lazyLoad(() => import('../components/Preview'));
const Settings = lazyLoad(() => import('../components/Settings'));
const PerformanceMonitor = lazyLoad(() => import('../components/PerformanceMonitor'));
const PerformanceLogAnalysis = lazyLoad(() => import('../components/PerformanceLogAnalysis'));

export const routes = [
    {
        path: '/',
        component: TextEditor,
        exact: true
    },
    {
        path: '/template',
        component: TemplateSelector
    },
    {
        path: '/style',
        component: StyleEditor
    },
    {
        path: '/preview',
        component: Preview
    },
    {
        path: '/settings',
        component: Settings
    },
    {
        path: '/performance',
        component: PerformanceMonitor
    },
    {
        path: '/analysis',
        component: PerformanceLogAnalysis
    }
];

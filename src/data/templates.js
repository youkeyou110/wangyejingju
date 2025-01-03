export const templates = [
    {
        id: 'template1',
        name: '简约白',
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect width="120" height="80" fill="%23ffffff"/%3E%3C/svg%3E',
        style: {
            background: '#ffffff',
            color: '#333333',
            padding: '20px',
            borderRadius: '8px'
        }
    },
    {
        id: 'template2',
        name: '暗夜黑',
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect width="120" height="80" fill="%23333333"/%3E%3C/svg%3E',
        style: {
            background: '#333333',
            color: '#ffffff',
            padding: '20px',
            borderRadius: '8px'
        }
    },
    {
        id: 'template3',
        name: '渐变蓝',
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%234285f4;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%2334a853;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="120" height="80" fill="url(%23grad)"/%3E%3C/svg%3E',
        style: {
            background: 'linear-gradient(135deg, #4285f4, #34a853)',
            color: '#ffffff',
            padding: '20px',
            borderRadius: '8px'
        }
    }
];

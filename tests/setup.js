import { chrome } from 'jest-chrome';
global.chrome = chrome;

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
    })
);

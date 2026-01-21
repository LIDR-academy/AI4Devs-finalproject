import '@testing-library/jest-dom';

// Suppress React Router future flag warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
    console.warn = (...args: any[]) => {
        const message = args[0];
        if (
            typeof message === 'string' &&
            (message.includes('React Router Future Flag Warning') ||
                message.includes('v7_startTransition') ||
                message.includes('v7_relativeSplatPath'))
        ) {
            return;
        }
        originalWarn(...args);
    };
});

afterAll(() => {
    console.warn = originalWarn;
});

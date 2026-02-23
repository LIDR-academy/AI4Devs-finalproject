/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests/integration'],
    testMatch: ['**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

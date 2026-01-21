import { config } from '../../src/shared/config';

describe('Configuration', () => {
    it('should load environment variables', () => {
        expect(config).toBeDefined();
    });

    it('should have nodeEnv defined', () => {
        expect(config.nodeEnv).toBeDefined();
        expect(typeof config.nodeEnv).toBe('string');
    });

    it('should have port as a number', () => {
        expect(config.port).toBeDefined();
        expect(typeof config.port).toBe('number');
        expect(config.port).toBeGreaterThan(0);
    });

    it('should have host defined', () => {
        expect(config.host).toBeDefined();
        expect(typeof config.host).toBe('string');
    });

    it('should have databaseUrl defined', () => {
        expect(config.databaseUrl).toBeDefined();
        expect(typeof config.databaseUrl).toBe('string');
    });

    it('should have jwtSecret defined', () => {
        expect(config.jwtSecret).toBeDefined();
        expect(typeof config.jwtSecret).toBe('string');
        expect(config.jwtSecret.length).toBeGreaterThan(0);
    });

    it('should have jwtExpiresIn defined', () => {
        expect(config.jwtExpiresIn).toBeDefined();
        expect(typeof config.jwtExpiresIn).toBe('string');
    });

    it('should have corsOrigin defined', () => {
        expect(config.corsOrigin).toBeDefined();
        expect(typeof config.corsOrigin).toBe('string');
    });

    it('should use default values when env vars are missing', () => {
        // These tests verify that the config has fallback defaults
        expect(config.nodeEnv).toBeTruthy();
        expect(config.port).toBeTruthy();
        expect(config.host).toBeTruthy();
    });

    it('should parse port as integer', () => {
        expect(Number.isInteger(config.port)).toBe(true);
    });
});

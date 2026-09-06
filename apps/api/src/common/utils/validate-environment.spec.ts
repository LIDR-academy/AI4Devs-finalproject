import {
  InvalidEnvironmentError,
  isStrictConfigMode,
  validateEnvironment,
} from './validate-environment';

describe('validate-environment', () => {
  const validStrictInput = {
    nodeEnv: 'production',
    jwtAccessSecret: 'a'.repeat(32),
    jwtRefreshSecret: 'b'.repeat(32),
    databaseUrl:
      'postgresql://mecatrack:Str0ng_Db_Pass_9x!@localhost:5434/mecatrack',
  };

  describe('isStrictConfigMode', () => {
    it('should be strict in production', () => {
      expect(
        isStrictConfigMode({
          ...validStrictInput,
          nodeEnv: 'production',
        }),
      ).toBe(true);
    });

    it('should be strict when ENFORCE_SECURE_CONFIG=true', () => {
      expect(
        isStrictConfigMode({
          ...validStrictInput,
          nodeEnv: 'development',
          enforceSecureConfig: 'true',
        }),
      ).toBe(true);
    });

    it('should not be strict in normal development', () => {
      expect(
        isStrictConfigMode({
          ...validStrictInput,
          nodeEnv: 'development',
          enforceSecureConfig: undefined,
        }),
      ).toBe(false);
    });
  });

  describe('validateEnvironment', () => {
    it('should allow development placeholders without enforcement', () => {
      expect(() =>
        validateEnvironment({
          nodeEnv: 'development',
          jwtAccessSecret: 'change-me-access-secret-min-32-chars',
          jwtRefreshSecret: 'change-me-refresh-secret-min-32-chars',
          databaseUrl:
            'postgresql://mecatrack:mecatrack@localhost:5435/mecatrack_dev',
        }),
      ).not.toThrow();
    });

    it('should accept valid production secrets', () => {
      expect(() => validateEnvironment(validStrictInput)).not.toThrow();
    });

    it('should reject missing JWT secrets in production', () => {
      expect(() =>
        validateEnvironment({
          ...validStrictInput,
          jwtAccessSecret: undefined,
        }),
      ).toThrow(/JWT_ACCESS_SECRET is required/);
    });

    it('should reject short JWT secrets in production', () => {
      expect(() =>
        validateEnvironment({
          ...validStrictInput,
          jwtAccessSecret: 'too-short',
        }),
      ).toThrow(/at least 32 characters/);
    });

    it('should reject placeholder JWT secrets in production', () => {
      expect(() =>
        validateEnvironment({
          ...validStrictInput,
          jwtAccessSecret: 'change-me-access-secret-min-32-chars',
        }),
      ).toThrow(/committed placeholder/);

      expect(() =>
        validateEnvironment({
          ...validStrictInput,
          jwtRefreshSecret: 'mecatrack-docker-refresh-secret-min-32-chars',
        }),
      ).toThrow(/committed placeholder/);
    });

    it('should reject trivial database passwords in production', () => {
      expect(() =>
        validateEnvironment({
          ...validStrictInput,
          databaseUrl:
            'postgresql://mecatrack:mecatrack@localhost:5434/mecatrack',
        }),
      ).toThrow(/trivial database password/);
    });

    it('should reject missing DATABASE_URL in production', () => {
      expect(() =>
        validateEnvironment({
          ...validStrictInput,
          databaseUrl: undefined,
        }),
      ).toThrow(InvalidEnvironmentError);
    });

    it('should not include secret values in error messages', () => {
      const secret = `secret-value-${'x'.repeat(40)}`;
      try {
        validateEnvironment({
          ...validStrictInput,
          jwtAccessSecret: 'change-me-access-secret-min-32-chars',
        });
        fail('expected validation to throw');
      } catch (error) {
        expect((error as Error).message).not.toContain(secret);
        expect((error as Error).message).not.toContain(
          'change-me-access-secret-min-32-chars',
        );
      }
    });
  });
});

import {
  UnsafeDestructiveOperationError,
  formatTargetSummary,
  getSanitizedDbTarget,
  validateDestructiveExecution,
} from './destructive-db-ops';

describe('destructive-db-ops', () => {
  describe('validateDestructiveExecution', () => {
    const validInput = {
      nodeEnv: 'development',
      allowDestructiveDbOps: 'true',
      argv: ['node', 'script.ts', '--confirm'],
    };

    it('should allow execution when all safety gates pass', () => {
      expect(() => validateDestructiveExecution(validInput)).not.toThrow();
    });

    it('should reject when NODE_ENV is production', () => {
      expect(() =>
        validateDestructiveExecution({
          ...validInput,
          nodeEnv: 'production',
        }),
      ).toThrow(UnsafeDestructiveOperationError);

      expect(() =>
        validateDestructiveExecution({
          ...validInput,
          nodeEnv: 'production',
        }),
      ).toThrow(/NODE_ENV=production/);
    });

    it('should reject when ALLOW_DESTRUCTIVE_DB_OPS is missing', () => {
      expect(() =>
        validateDestructiveExecution({
          ...validInput,
          allowDestructiveDbOps: undefined,
        }),
      ).toThrow(/ALLOW_DESTRUCTIVE_DB_OPS=true is required/);
    });

    it('should reject when ALLOW_DESTRUCTIVE_DB_OPS is not true', () => {
      expect(() =>
        validateDestructiveExecution({
          ...validInput,
          allowDestructiveDbOps: 'false',
        }),
      ).toThrow(/ALLOW_DESTRUCTIVE_DB_OPS=true is required/);
    });

    it('should reject when --confirm flag is missing', () => {
      expect(() =>
        validateDestructiveExecution({
          ...validInput,
          argv: ['node', 'script.ts'],
        }),
      ).toThrow(/--confirm/);
    });

    it('should accept --yes as confirmation flag', () => {
      expect(() =>
        validateDestructiveExecution({
          ...validInput,
          argv: ['node', 'script.ts', '--yes'],
        }),
      ).not.toThrow();
    });
  });

  describe('getSanitizedDbTarget', () => {
    it('should parse host, port and database without credentials', () => {
      const target = getSanitizedDbTarget(
        'postgresql://mecatrack:secret@localhost:5435/mecatrack_dev',
      );

      expect(target).toEqual({
        host: 'localhost',
        port: '5435',
        database: 'mecatrack_dev',
      });
    });

    it('should reject invalid DATABASE_URL', () => {
      expect(() => getSanitizedDbTarget('not-a-url')).toThrow(
        UnsafeDestructiveOperationError,
      );
    });
  });

  describe('formatTargetSummary', () => {
    it('should render a sanitized summary without secrets', () => {
      const summary = formatTargetSummary(
        {
          host: 'localhost',
          port: '5435',
          database: 'mecatrack_dev',
        },
        'development',
      );

      expect(summary).toContain('NODE_ENV: development');
      expect(summary).toContain('host: localhost');
      expect(summary).toContain('port: 5435');
      expect(summary).toContain('database: mecatrack_dev');
      expect(summary).not.toContain('secret');
      expect(summary).not.toContain('mecatrack:mecatrack');
    });
  });
});

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(__dirname, '..');

describe('US-000-TASK-03: Prisma schema smoke tests', () => {
  it('schema.prisma contains all required models', () => {
    const schema = fs.readFileSync(path.join(ROOT, 'backend/prisma/schema.prisma'), 'utf-8');
    expect(schema).toContain('model Product');
    expect(schema).toContain('model Cart');
    expect(schema).toContain('model CartItem');
    expect(schema).toContain('model Order');
    expect(schema).toContain('model OrderItem');
  });

  it('schema.prisma defines GIN indexes for filter arrays', () => {
    const schema = fs.readFileSync(path.join(ROOT, 'backend/prisma/schema.prisma'), 'utf-8');
    expect(schema).toContain('type: Gin');
    // Check all 4 filter arrays have GIN indexes
    expect(schema).toContain('@@index([distance]');
    expect(schema).toContain('@@index([surface]');
    expect(schema).toContain('@@index([level]');
    expect(schema).toContain('@@index([objective]');
  });

  it('schema.prisma uses Decimal for price fields', () => {
    const schema = fs.readFileSync(path.join(ROOT, 'backend/prisma/schema.prisma'), 'utf-8');
    expect(schema).toContain('@db.Decimal(10, 2)');
    // Ensure Float is NOT used for prices
    expect(schema).not.toContain('Float');
  });

  it('prisma validate passes (schema is syntactically valid)', () => {
    // This test runs prisma validate which does NOT require a database connection.
    // DATABASE_URL must be set (even a dummy value) because Prisma 5 validates
    // env vars during schema parsing, but no actual connection is made.
    expect(() => {
      execSync('npx prisma validate', {
        cwd: path.join(ROOT, 'backend'),
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: 'postgresql://user:pass@localhost:5432/runmarket' }
      });
    }).not.toThrow();
  });
});

describe('US-000-TASK-02: Backend scaffolding smoke tests', () => {
  describe('backend/tsconfig.json', () => {
    it('has strict: true', () => {
      const filePath = path.join(ROOT, 'backend', 'tsconfig.json');
      expect(fs.existsSync(filePath)).toBe(true);
      const tsconfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });
  });

  describe('backend/eslint.config.mjs', () => {
    it('exists', () => {
      const filePath = path.join(ROOT, 'backend', 'eslint.config.mjs');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});

describe('US-000-TASK-07: Frontend scaffolding smoke tests', () => {
  it('frontend tsconfig.json has strict: true', () => {
    const tsconfig = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'frontend/tsconfig.json'), 'utf-8')
    );
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('frontend eslint.config.mjs exists', () => {
    expect(
      fs.existsSync(path.join(ROOT, 'frontend/eslint.config.mjs'))
    ).toBe(true);
  });
});

describe('US-000-TASK-01: Monorepo scaffolding smoke tests', () => {
  describe('docker-compose.yml', () => {
    it('exists and contains postgres service', () => {
      const filePath = path.join(ROOT, 'docker-compose.yml');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('postgres');
    });
  });

  describe('.env.example', () => {
    it('contains all 4 required variables', () => {
      const filePath = path.join(ROOT, '.env.example');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('DATABASE_URL');
      expect(content).toContain('CORS_ORIGIN');
      expect(content).toContain('SESSION_SECRET');
      expect(content).toContain('ASSETS_BASE_URL');
    });
  });

  describe('package.json', () => {
    it('has workspaces with frontend and backend', () => {
      const filePath = path.join(ROOT, 'package.json');
      expect(fs.existsSync(filePath)).toBe(true);
      const pkg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(pkg.workspaces).toContain('frontend');
      expect(pkg.workspaces).toContain('backend');
    });
  });
});

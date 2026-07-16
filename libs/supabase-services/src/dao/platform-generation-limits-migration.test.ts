import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPath = resolve(
  __dirname,
  '../../../../supabase/migrations/20260716190000_platform_generation_limits.sql',
);

describe('platform generation limits migration', () => {
  it('atomically enforces per-user rate, concurrency, and daily quota controls', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    expect(sql).toMatch(/select \*[\s\S]*for update/i);
    expect(sql).toMatch(/minute_requests >= 5/i);
    expect(sql).toMatch(/day_requests >= 50/i);
    expect(sql).toMatch(/lease_expires_at > now_at/i);
    expect(sql).toMatch(/create function public\.release_platform_generation_slot/i);
    expect(sql).toMatch(
      /revoke all on function public\.acquire_platform_generation_slot\(uuid\)\s+from public, anon, authenticated/i,
    );
    expect(sql).toMatch(
      /grant execute on function public\.acquire_platform_generation_slot\(uuid\) to service_role/i,
    );
  });
});

import { getSupabase, initSupabase } from './supabase-client';

describe('supabase-client', () => {
  it('throws when getSupabase is called before initSupabase', () => {
    expect(() => getSupabase()).toThrow(
      'Supabase client not initialized. Call initSupabase() first.',
    );
  });

  it('returns the client created by initSupabase', () => {
    const client = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
    expect(getSupabase()).toBe(client);
  });
});

import { execSync } from 'node:child_process';
import path from 'node:path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type LocalSupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
};

type SupabaseTestUser = {
  client: SupabaseClient;
  userId: string;
};

const getLocalSupabaseConfig = (): LocalSupabaseConfig => {
  const repoRoot = path.resolve(__dirname, '../../../..');
  const output = execSync('npx supabase status -o json', { cwd: repoRoot, encoding: 'utf-8' });
  const status = JSON.parse(output.slice(output.indexOf('{')));
  return { url: status.API_URL, anonKey: status.ANON_KEY, serviceRoleKey: status.SERVICE_ROLE_KEY };
};

export const createSupabaseTestHelpers = () => {
  const config = getLocalSupabaseConfig();
  const adminClient = createClient(config.url, config.serviceRoleKey);
  const createdUserIds: string[] = [];

  const createAuthenticatedUser = async (label: string): Promise<SupabaseTestUser> => {
    const email = `supabase-test-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const password = 'supabase-test-password';
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error('user creation failed');
    createdUserIds.push(data.user.id);

    const client = createClient(config.url, config.anonKey);
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    return { client, userId: data.user.id };
  };

  const cleanup = async () => {
    await Promise.all(createdUserIds.map((userId) => adminClient.auth.admin.deleteUser(userId)));
  };

  return { adminClient, createAuthenticatedUser, cleanup };
};

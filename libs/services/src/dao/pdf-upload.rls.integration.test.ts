// @s14 — real, executed RLS/cross-user-isolation proof against a LOCAL Supabase stack (Docker).
// NOT part of the default `pnpm test` run (see jest.config.js's testPathIgnorePatterns) — this
// repo's other Jest tests are fully mocked and must never require Docker. Run manually with:
//
//   pnpm --filter @helsoft/services test:rls
//
// (equivalent to `NODE_OPTIONS=--experimental-vm-modules jest --config jest.rls.config.js`).
// Requires `npx supabase start` (or `db reset`) to already be running locally — see
// docs/features/pdf-upload-extraction/tdd.md for the real, executed pass/fail result.
import { execSync } from 'node:child_process';
import path from 'node:path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type LocalSupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
};

/** Reads the current local stack's URL/keys via `supabase status` rather than hardcoding them,
 * so a regenerated local project can't silently drift out of sync with this test. */
const getLocalSupabaseConfig = (): LocalSupabaseConfig => {
  const repoRoot = path.resolve(__dirname, '../../../..');
  const output = execSync('npx supabase status -o json', { cwd: repoRoot, encoding: 'utf-8' });
  const jsonStart = output.indexOf('{');
  const status = JSON.parse(output.slice(jsonStart));
  return { url: status.API_URL, anonKey: status.ANON_KEY, serviceRoleKey: status.SERVICE_ROLE_KEY };
};

const uniqueEmail = (label: string): string => `pdf-upload-rls-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
const TEST_PASSWORD = 'super-secret-1';

const signUpAndSignIn = async (
  adminClient: SupabaseClient,
  config: LocalSupabaseConfig,
  label: string,
): Promise<{ client: SupabaseClient; userId: string }> => {
  const email = uniqueEmail(label);
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (createError || !created.user) throw createError ?? new Error('user creation failed');

  const client = createClient(config.url, config.anonKey);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (signInError) throw signInError;

  return { client, userId: created.user.id };
};

describe('pdf-upload-extraction RLS (@s14, live local Supabase)', () => {
  let config: LocalSupabaseConfig;
  let adminClient: SupabaseClient;
  let userA: { client: SupabaseClient; userId: string };
  let userB: { client: SupabaseClient; userId: string };
  let anonClient: SupabaseClient;
  let documentAId: string;

  beforeAll(async () => {
    config = getLocalSupabaseConfig();
    adminClient = createClient(config.url, config.serviceRoleKey);
    userA = await signUpAndSignIn(adminClient, config, 'a');
    userB = await signUpAndSignIn(adminClient, config, 'b');
    anonClient = createClient(config.url, config.anonKey);

    const { data, error } = await userA.client
      .from('documents')
      .insert({ user_id: userA.userId, filename: 'a.pdf', size_bytes: 1024 })
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error('seed insert failed');
    documentAId = data.id;
  });

  it('lets a user select their own document row', async () => {
    const { data } = await userA.client.from('documents').select('id').eq('id', documentAId);

    expect(data).toEqual([{ id: documentAId }]);
  });

  it("denies another authenticated user visibility into someone else's document row", async () => {
    const { data, error } = await userB.client.from('documents').select('id').eq('id', documentAId);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("denies another authenticated user's update of someone else's document row", async () => {
    const { data } = await userB.client
      .from('documents')
      .update({ filename: 'hijacked.pdf' })
      .eq('id', documentAId)
      .select('id');

    expect(data).toEqual([]);

    const { data: stillOriginal } = await adminClient.from('documents').select('filename').eq('id', documentAId).single();
    expect(stillOriginal?.filename).toBe('a.pdf');
  });

  it("denies another authenticated user's delete of someone else's document row", async () => {
    await userB.client.from('documents').delete().eq('id', documentAId);

    const { data: stillExists } = await adminClient.from('documents').select('id').eq('id', documentAId).single();
    expect(stillExists?.id).toBe(documentAId);
  });

  it("scopes document_images visibility to the parent document's owner", async () => {
    const { data: imageRow, error: insertError } = await userA.client
      .from('document_images')
      .insert({
        document_id: documentAId,
        page_number: 1,
        position_index: 0,
        storage_path: `${userA.userId}/${documentAId}/p1-0.jpg`,
        width: 200,
        height: 200,
        mime_type: 'image/jpeg',
      })
      .select('id')
      .single();
    expect(insertError).toBeNull();

    const { data: seenByOwner } = await userA.client.from('document_images').select('id').eq('id', imageRow!.id);
    expect(seenByOwner).toEqual([{ id: imageRow!.id }]);

    const { data: seenByOther } = await userB.client.from('document_images').select('id').eq('id', imageRow!.id);
    expect(seenByOther).toEqual([]);
  });

  it('denies an unauthenticated (anon, no session) request from seeing any documents', async () => {
    const { data, error } = await anonClient.from('documents').select('id');

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('denies an unauthenticated (anon, no session) request from inserting a document row', async () => {
    const { error } = await anonClient.from('documents').insert({ user_id: userA.userId, filename: 'x.pdf', size_bytes: 1 });

    expect(error).not.toBeNull();
  });

  it("lets a user upload to their own storage path and denies another user's download of it", async () => {
    const path = `${userA.userId}/${documentAId}/source.pdf`;
    const { error: uploadError } = await userA.client.storage
      .from('pdf-uploads')
      .upload(path, new Blob([new Uint8Array([1, 2, 3])]), { contentType: 'application/pdf', upsert: true });
    expect(uploadError).toBeNull();

    const { data: ownDownload, error: ownDownloadError } = await userA.client.storage.from('pdf-uploads').download(path);
    expect(ownDownloadError).toBeNull();
    expect(ownDownload).not.toBeNull();

    const { data: otherDownload, error: otherDownloadError } = await userB.client.storage.from('pdf-uploads').download(path);
    expect(otherDownload).toBeNull();
    expect(otherDownloadError).not.toBeNull();
  });

  it('denies an unauthenticated (anon, no session) request from uploading to pdf-uploads', async () => {
    const path = `${userA.userId}/${documentAId}/anon-attempt.pdf`;
    const { error } = await anonClient.storage
      .from('pdf-uploads')
      .upload(path, new Blob([new Uint8Array([1])]), { contentType: 'application/pdf' });

    expect(error).not.toBeNull();
  });
});

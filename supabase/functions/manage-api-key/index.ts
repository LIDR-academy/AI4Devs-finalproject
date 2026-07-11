// manage-api-key -- the first Edge Function in the repo (task-2, Slice 1: `save` action;
// `remove` added in task-9, Slice 2). This file is intentionally thin HTTP/Supabase wiring --
// the actual decision logic lives in the pure, Deno-unit-tested modules it composes
// (validate-key.ts, handle-save.ts, handle-remove.ts, logger.ts). Verified here via manual
// smoke against a running Supabase stack, per risks.md R1 (Deno/Edge sits outside the
// Jest/Stryker harness).
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

import { handleRemoveApiKey, type RemoveApiKeyResult } from './handle-remove.ts';
import { handleSaveApiKey, type SaveApiKeyResult } from './handle-save.ts';
import { logEvent } from './logger.ts';
import { isAiProvider, validateKey, type AiProvider } from './validate-key.ts';

type SaveRequestBody = {
  action: 'save';
  provider: AiProvider;
  apiKey: string;
};

type RemoveRequestBody = {
  action: 'remove';
};

type RequestBody = SaveRequestBody | RemoveRequestBody;

type DispatchResult = { status: number; body: SaveApiKeyResult | RemoveApiKeyResult };

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const errorStatus = (result: SaveApiKeyResult | RemoveApiKeyResult): number => {
  if (!('code' in result)) return 200;
  return result.code === 'invalid_key' ? 401 : 502;
};

/**
 * Authenticates the caller from the request's own JWT -- user_id is derived here, never
 * trusted from the client-supplied request body (task-2 Goal, step 1). Returns `null` on any
 * auth failure so the caller can respond 401 without inspecting Supabase's own error shape.
 */
const authenticateCaller = async (
  request: Request,
  supabaseUrl: string,
  anonKey: string,
): Promise<{ userId: string } | null> => {
  const authHeader = request.headers.get('Authorization') ?? '';
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error,
  } = await callerClient.auth.getUser();

  if (error || !user) return null;
  return { userId: user.id };
};

/**
 * Routes a parsed, already-authenticated request body to the save or remove handler. Returns
 * `null` for a malformed/unrecognized body (Full review round 1, Minor 11: `body.provider`
 * must be a member of the closed AiProvider allow-list, not just truthy -- no check constraint
 * exists on `user_ai_keys.provider`) so the caller can respond 400.
 */
const dispatch = async (
  body: Partial<RequestBody>,
  adminClient: SupabaseClient,
  userId: string,
): Promise<DispatchResult | null> => {
  if (body.action === 'remove') {
    const result = await handleRemoveApiKey(
      { userId },
      {
        removeApiKey: async ({ userId: id }) => {
          const { error } = await adminClient.rpc('remove_api_key', { p_user_id: id });
          if (error) throw error;
        },
        log: logEvent,
      },
    );
    return { status: errorStatus(result), body: result };
  }

  if (body.action !== 'save' || !isAiProvider(body.provider) || typeof body.apiKey !== 'string') {
    return null;
  }

  const result = await handleSaveApiKey(
    { userId, provider: body.provider, apiKey: body.apiKey },
    {
      validateKey,
      storeApiKey: async ({ userId: id, provider, apiKey }) => {
        const { data, error } = await adminClient.rpc('save_api_key', {
          p_user_id: id,
          p_provider: provider,
          p_api_key: apiKey,
        });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        return { provider: row.provider, updatedAt: row.updated_at };
      },
      log: logEvent,
    },
  );
  return { status: errorStatus(result), body: result };
};

Deno.serve(async (request: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  // Tracks which action was being handled so the catch-all failure log below is still
  // shaped correctly (@s12) even when the failure happens before/during dispatch.
  let action: 'save' | 'remove' = 'save';

  try {
    const caller = await authenticateCaller(request, supabaseUrl, anonKey);
    if (!caller) {
      return jsonResponse(401, { code: 'network_error' });
    }

    const body = (await request.json()) as Partial<RequestBody>;
    if (body.action === 'remove') action = 'remove';
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const result = await dispatch(body, adminClient, caller.userId);
    if (!result) {
      return jsonResponse(400, { code: 'network_error' });
    }
    return jsonResponse(result.status, result.body);
  } catch {
    // Redacted per @s12 -- never log the request body or key, only a generic outcome.
    logEvent({ action, outcome: 'network_error', userId: 'unknown' });
    return jsonResponse(502, { code: 'network_error' });
  }
});

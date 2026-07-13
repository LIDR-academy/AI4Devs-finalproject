import type { ApiKeyStatus, SaveApiKeyParams } from '@helsoft/types';

import { getSupabase } from '../supabase/supabase-client';

type UserAiKeyRow = { provider: string; updated_at: string };

/**
 * Raw data access for the AI-key store. No validation, no error mapping — the service layer
 * decides what an invalid-key or network failure means to the UI (`.agents/rules/hooks-service-dao.mdc`).
 *
 * Both methods are Supabase DAO calls (Pattern A) — there is no external-API DAO here: the
 * provider probe happens inside the `manage-api-key` Edge Function, not the client
 * (spec.md's architecture note).
 */
export abstract class ApiKeyDao {
  static async saveApiKey({ provider, apiKey }: SaveApiKeyParams): Promise<ApiKeyStatus> {
    const { data, error } = await getSupabase().functions.invoke('manage-api-key', {
      body: { action: 'save', provider, apiKey },
    });
    if (error) throw error;
    return data as ApiKeyStatus;
  }

  static async getApiKeyStatus(): Promise<ApiKeyStatus> {
    // Non-secret columns only (@s11) — RLS already scopes this to the caller's own row.
    const { data, error } = await getSupabase().from('user_ai_keys').select('provider, updated_at');
    if (error) throw error;

    const row = (data as UserAiKeyRow[] | null)?.[0];
    if (!row) return { hasKey: false };
    return { hasKey: true, provider: row.provider as ApiKeyStatus['provider'], updatedAt: row.updated_at };
  }

  static async removeApiKey(): Promise<ApiKeyStatus> {
    const { data, error } = await getSupabase().functions.invoke('manage-api-key', {
      body: { action: 'remove' },
    });
    if (error) throw error;
    return data as ApiKeyStatus;
  }
}

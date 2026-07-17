-- ai-key-management (Slice 2, task-9) -- remove_api_key(): the counterpart to save_api_key(),
-- deleting both the Vault secret and the user_ai_keys metadata row. Same security model as
-- save_api_key (spec.md "save/validate AND remove both route through the service-role Edge
-- Function"): security definer to reach the vault schema, execute restricted to service_role
-- only -- an authenticated client cannot call this directly even with a valid JWT, only
-- indirectly via the Edge Function, which authenticates the caller and supplies p_user_id
-- itself (never a client-supplied id).

create function public.remove_api_key(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, vault, pg_temp
as $$
declare
  v_secret_id uuid;
begin
  select uak.secret_id into v_secret_id
  from public.user_ai_keys uak
  where uak.user_id = p_user_id;

  if v_secret_id is not null then
    delete from vault.secrets where id = v_secret_id;
  end if;

  delete from public.user_ai_keys where user_id = p_user_id;
end;
$$;

revoke all on function public.remove_api_key(uuid) from public;
grant execute on function public.remove_api_key(uuid) to service_role;

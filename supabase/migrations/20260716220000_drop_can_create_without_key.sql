-- Drop redundant plans.can_create_without_key; create UI derives from use_platform_key || hasKey.
alter table public.plans
  drop column if exists can_create_without_key;

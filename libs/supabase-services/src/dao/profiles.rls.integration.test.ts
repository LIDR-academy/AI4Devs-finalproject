import { createSupabaseTestHelpers } from '../testing/supabase-test-helpers';

describe('profiles migration (@s1, live local Supabase)', () => {
  const helpers = createSupabaseTestHelpers();
  let userA: Awaited<ReturnType<typeof helpers.createAuthenticatedUser>>;
  let userB: Awaited<ReturnType<typeof helpers.createAuthenticatedUser>>;

  beforeAll(async () => {
    userA = await helpers.createAuthenticatedUser('profiles-a');
    userB = await helpers.createAuthenticatedUser('profiles-b');
  });

  afterAll(() => helpers.cleanup());

  it('trigger inserts exactly one default-free profile for each new auth user', async () => {
    const { data, count, error } = await helpers.adminClient
      .from('profiles')
      .select('id, plan_id', { count: 'exact' })
      .eq('id', userA.userId);

    expect(error).toBeNull();
    expect(count).toBe(1);
    expect(data).toEqual([{ id: userA.userId, plan_id: 'free' }]);
  });

  it('FK rejects every plan_id outside seeded plans', async () => {
    const { error } = await helpers.adminClient
      .from('profiles')
      .update({ plan_id: 'enterprise' })
      .eq('id', userA.userId);

    expect(error).not.toBeNull();
  });

  it('select-own RLS hides one authenticated user profile from another', async () => {
    const { data: ownProfile } = await userA.client.from('profiles').select('id, plan_id');
    const { data: otherProfile } = await userB.client
      .from('profiles')
      .select('id')
      .eq('id', userA.userId);

    expect(ownProfile).toEqual([{ id: userA.userId, plan_id: 'free' }]);
    expect(otherProfile).toEqual([]);
  });

  it('authenticated users can read seeded plan flags', async () => {
    const { data, error } = await userA.client
      .from('plans')
      .select('id, use_platform_key, show_ads, show_key_settings, can_create_without_key')
      .order('id');

    expect(error).toBeNull();
    expect(data).toEqual([
      {
        id: 'free',
        use_platform_key: false,
        show_ads: true,
        show_key_settings: true,
        can_create_without_key: false,
      },
      {
        id: 'paid',
        use_platform_key: true,
        show_ads: false,
        show_key_settings: false,
        can_create_without_key: true,
      },
    ]);
  });

  it('denies authenticated profile updates and deletes', async () => {
    const { error: updateError } = await userA.client
      .from('profiles')
      .update({ plan_id: 'paid' })
      .eq('id', userA.userId);
    const { error: deleteError } = await userA.client
      .from('profiles')
      .delete()
      .eq('id', userA.userId);
    const { data: unchanged } = await helpers.adminClient
      .from('profiles')
      .select('plan_id')
      .eq('id', userA.userId)
      .single();

    expect(updateError).not.toBeNull();
    expect(deleteError).not.toBeNull();
    expect(unchanged?.plan_id).toBe('free');
  });
});

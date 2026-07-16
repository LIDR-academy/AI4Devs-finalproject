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
      .select('id, plan', { count: 'exact' })
      .eq('id', userA.userId);

    expect(error).toBeNull();
    expect(count).toBe(1);
    expect(data).toEqual([{ id: userA.userId, plan: 'free' }]);
  });

  it('constraint rejects every plan outside free or paid', async () => {
    const { error } = await helpers.adminClient
      .from('profiles')
      .update({ plan: 'enterprise' })
      .eq('id', userA.userId);

    expect(error).not.toBeNull();
  });

  it('select-own RLS hides one authenticated user profile from another', async () => {
    const { data: ownProfile } = await userA.client.from('profiles').select('id, plan');
    const { data: otherProfile } = await userB.client
      .from('profiles')
      .select('id')
      .eq('id', userA.userId);

    expect(ownProfile).toEqual([{ id: userA.userId, plan: 'free' }]);
    expect(otherProfile).toEqual([]);
  });

  it('denies authenticated profile updates and deletes', async () => {
    const { error: updateError } = await userA.client
      .from('profiles')
      .update({ plan: 'paid' })
      .eq('id', userA.userId);
    const { error: deleteError } = await userA.client
      .from('profiles')
      .delete()
      .eq('id', userA.userId);
    const { data: unchanged } = await helpers.adminClient
      .from('profiles')
      .select('plan')
      .eq('id', userA.userId)
      .single();

    expect(updateError).not.toBeNull();
    expect(deleteError).not.toBeNull();
    expect(unchanged?.plan).toBe('free');
  });
});

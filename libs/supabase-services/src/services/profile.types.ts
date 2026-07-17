import type { Profile } from '@helsoft/types';

/** Plan flags mapped for the client, before `canCreate` is derived from key status. */
export type ProfilePlan = Omit<Profile, 'canCreate'>;

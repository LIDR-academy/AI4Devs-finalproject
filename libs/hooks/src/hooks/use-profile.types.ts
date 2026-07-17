import type { Profile } from '@helsoft/types';
import type { ReactNode } from 'react';

export type UseProfileResult = {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
};

export type ProfileProviderProps = {
  children: ReactNode;
};

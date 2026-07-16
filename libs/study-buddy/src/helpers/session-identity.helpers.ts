type SessionUser = {
  email?: string | null;
  user_metadata?: { display_name?: string | null; full_name?: string | null };
};

export const getSessionIdentity = (user?: SessionUser | null) => {
  if (!user) return null;

  const label =
    user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? user.email ?? '';

  return {
    label,
    email: user.email ?? '',
    initials: label
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };
};

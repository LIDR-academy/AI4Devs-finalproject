export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'artist' | 'admin';
  avatarUrl: string | null;
  artistProfileId: string | null;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: UserSummary;
}

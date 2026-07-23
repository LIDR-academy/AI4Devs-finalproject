export interface AccompliceResponse {
  id: string;
  email: string;
  permissions: string[];
  isRevoked: boolean;
  grantedAt: string;
  lastAccessedAt?: string;
}

export interface InviteAccompliceRequest {
  email: string;
  permissions: string[];
}

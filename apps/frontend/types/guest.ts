export interface GuestUser {
  name: string;
  projectId: string;
  token: string;
  role: 'GUEST';
}

export interface InvitationResponse {
  id: string;
  projectId: string;
  email: string;
  token: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestLoginPayload {
  token: string;
}

export interface GuestLoginResponse {
  accessToken: string;
  project: {
    id: string;
    title: string;
  };
}

export interface RevokeShareResponse {
  success: boolean;
  message: string;
}

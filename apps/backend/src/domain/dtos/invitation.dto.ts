export interface CreateInvitationDto {
  projectId: string;
  email?: string;
}

export interface GuestLoginDto {
  token: string;
}

export interface InvitationResponseDto {
  id: string;
  projectId: string;
  email: string;
  token: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestLoginResponseDto {
  accessToken: string;
  project: {
    id: string;
    title: string;
  };
}

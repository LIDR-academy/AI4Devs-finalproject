export interface RegisterDeviceTokenPayload {
  token: string;
  platform?: "WEB";
}

export interface RegisterDeviceTokenResponse {
  id: string;
  platform: string;
  createdAt: string;
}

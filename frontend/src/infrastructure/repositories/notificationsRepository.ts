import type {
  RegisterDeviceTokenPayload,
  RegisterDeviceTokenResponse,
} from "@/domain/types/notification";
import apiClient from "@/infrastructure/repositories/apiClient";

export async function registerDeviceToken(
  payload: RegisterDeviceTokenPayload,
): Promise<RegisterDeviceTokenResponse> {
  const { data } = await apiClient.post<RegisterDeviceTokenResponse>(
    "/notifications/device-token",
    { token: payload.token, platform: payload.platform ?? "WEB" },
  );
  return data;
}

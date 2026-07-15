import { useMutation } from "@tanstack/react-query";
import apiClient from "@/infrastructure/repositories/apiClient";

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => apiClient.post("/auth/change-password", data),
  });
}

import { useMutation } from "@tanstack/react-query";
import { authRepository } from "@/infrastructure/repositories/authRepository";

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authRepository.login(credentials),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authRepository.logout(),
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: (refreshToken: string) => authRepository.refresh(refreshToken),
  });
}

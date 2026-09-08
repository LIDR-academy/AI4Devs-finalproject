import { useQuery } from "@tanstack/react-query";
import apiClient from "@/infrastructure/repositories/apiClient";

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  level: { id: string } | null;
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await apiClient.get<MeResponse>("/auth/me");
      return data;
    },
  });
}

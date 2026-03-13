import axios, { AxiosError, type AxiosInstance } from "axios";

import { API_URL, REQUEST_TIMEOUT_MS } from "@/lib/constants";
import type { ApiResponse } from "@/types/api";
import type { FileInfo } from "@/types/file";

export interface ApiClientConfig {
  getApiKey?: () => string | undefined;
}

export function createApiClient(config: ApiClientConfig = {}): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((requestConfig) => {
    const apiKey = config.getApiKey?.();
    if (apiKey) {
      requestConfig.headers["X-API-Key"] = apiKey;
    }
    return requestConfig;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(error),
  );

  return client;
}

let sharedApiClient: AxiosInstance | null = null;

export function initializeApiClient(getApiKey: () => string | undefined): void {
  sharedApiClient = createApiClient({ getApiKey });
}

export function getApiClient(): AxiosInstance {
  if (!sharedApiClient) {
    sharedApiClient = createApiClient();
  }
  return sharedApiClient;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  email: string;
  api_key: string;
}

export interface ApiStatusResponse {
  api_key_status: "active" | "inactive" | "revoked";
  created_at: string;
  last_renewed_at: string | null;
  usage_count: number;
}

export const api = {
  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await getApiClient().post<ApiResponse<RegisterResponse>>("/api/v1/users/register", data);
    return response.data;
  },

  getStatus: async (): Promise<ApiResponse<ApiStatusResponse>> => {
    const response = await getApiClient().post<ApiResponse<ApiStatusResponse>>("/api/v1/users/status");
    return response.data;
  },

  uploadFile: async (file: File): Promise<ApiResponse<FileInfo>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await getApiClient().post<ApiResponse<FileInfo>>("/api/v1/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};

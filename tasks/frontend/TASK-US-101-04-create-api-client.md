# TASK-US-101-04: Create API Client

## Parent User Story
[US-101: Frontend Project Setup](../../user-stories/frontend/US-101-frontend-project-setup.md)

## Description
Create a centralized API client for communicating with the backend. This includes setting up Axios with interceptors, React Query for data fetching, and typed API functions.

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps

### 1. Create API Client (src/lib/api.ts)
```typescript
/**
 * API Client for IPFS Gateway Backend
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add API key
apiClient.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem("api_key");
    if (apiKey) {
      config.headers["X-API-Key"] = apiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear stored credentials
      localStorage.removeItem("api_key");
      localStorage.removeItem("user_email");
      // Redirect to login if not already there
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Type definitions
export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  email: string;
  api_key: string;
}

export interface StatusResponse {
  api_key_status: "active" | "inactive" | "revoked";
  created_at: string;
  last_renewed_at: string | null;
  usage_count: number;
}

export interface FileInfo {
  id: number;
  cid: string;
  original_filename: string;
  size: number;
  pinned: boolean;
  uploaded_at: string;
}

export interface UploadResponse {
  cid: string;
  original_filename: string;
  size: number;
  pinned: boolean;
  uploaded_at: string;
}

// API Functions
export const api = {
  // Authentication
  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>("/register", data);
    return response.data;
  },

  getStatus: async (): Promise<ApiResponse<StatusResponse>> => {
    const response = await apiClient.post<ApiResponse<StatusResponse>>("/status");
    return response.data;
  },

  renewApiKey: async (email: string): Promise<ApiResponse<{ api_key: string }>> => {
    const response = await apiClient.post<ApiResponse<{ api_key: string }>>("/renew", { email });
    return response.data;
  },

  // File Operations
  uploadFile: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<UploadResponse>>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  retrieveFile: async (cid: string): Promise<Blob> => {
    const response = await apiClient.get(`/retrieve/${cid}`, {
      responseType: "blob",
    });
    return response.data;
  },

  getFileInfo: async (cid: string): Promise<ApiResponse<FileInfo>> => {
    const response = await apiClient.get<ApiResponse<FileInfo>>(`/files/${cid}`);
    return response.data;
  },

  listFiles: async (page: number = 1, perPage: number = 20): Promise<ApiResponse<{
    files: FileInfo[];
    pagination: {
      page: number;
      per_page: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await apiClient.get("/files", {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  // Pinning Operations
  pinContent: async (cid: string): Promise<ApiResponse<{ cid: string; pinned: boolean }>> => {
    const response = await apiClient.post(`/pin/${cid}`);
    return response.data;
  },

  unpinContent: async (cid: string): Promise<ApiResponse<{ cid: string; pinned: boolean }>> => {
    const response = await apiClient.post(`/unpin/${cid}`);
    return response.data;
  },
};

export default api;
```

### 2. Create React Query Setup (src/lib/query-client.ts)
```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### 3. Create Query Provider (src/components/providers/query-provider.tsx)
```typescript
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 4. Create Custom Hooks (src/hooks/use-files.ts)
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export function useFiles(page: number = 1, perPage: number = 20) {
  return useQuery({
    queryKey: ["files", page, perPage],
    queryFn: () => api.listFiles(page, perPage),
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (p: number) => void }) =>
      api.uploadFile(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("File uploaded successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });
}

export function usePinContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cid: string) => api.pinContent(cid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("Content pinned successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Pinning failed: ${error.message}`);
    },
  });
}
```

## Acceptance Criteria
- [ ] API client is created with proper interceptors
- [ ] All API endpoints are typed
- [ ] React Query is set up with provider
- [ ] Custom hooks are created for common operations
- [ ] Error handling is consistent
- [ ] TypeScript types are complete

## Notes
- Store API key in localStorage (consider more secure options for production)
- Use React Query for caching and state management
- Add proper error handling and user feedback

## Completion Status
- [ ] 0% - Not Started

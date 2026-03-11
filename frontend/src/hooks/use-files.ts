"use client";

import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => api.uploadFile(file),
  });
}

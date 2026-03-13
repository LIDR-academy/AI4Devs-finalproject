"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { MAX_CONCURRENT_FILES, validateBatch } from "@/lib/file-validation";
import { useUploadStore } from "@/stores/upload-store";
import type { UploadEntry, UploadHistoryEntry, UploadRoutePayload, UploadStatusPayload } from "@/types/upload";

import { useAuth } from "./use-auth";

function createUploadId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readJsonPayload<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

type RouteEnvelope<T> = {
  status: number;
  message?: string;
  data?: T;
};

export function useUpload() {
  const router = useRouter();
  const { logout } = useAuth();
  const entries = useUploadStore((state) => state.entries);
  const history = useUploadStore((state) => state.history);
  const addEntries = useUploadStore((state) => state.addEntries);
  const updateEntry = useUploadStore((state) => state.updateEntry);
  const removeEntry = useUploadStore((state) => state.removeEntry);
  const addHistory = useUploadStore((state) => state.addHistory);
  const clearHistory = useUploadStore((state) => state.clearHistory);
  const resetAll = useUploadStore((state) => state.resetAll);

  const entriesRef = useRef(entries);
  const xhrMapRef = useRef(new Map<string, XMLHttpRequest>());
  const pollTimeoutMapRef = useRef(new Map<string, number>());
  const handledUnauthorizedRef = useRef(false);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    const xhrMap = xhrMapRef.current;
    const pollTimeoutMap = pollTimeoutMapRef.current;

    return () => {
      for (const xhr of xhrMap.values()) {
        xhr.abort();
      }
      xhrMap.clear();

      for (const timeoutId of pollTimeoutMap.values()) {
        window.clearTimeout(timeoutId);
      }
      pollTimeoutMap.clear();
    };
  }, []);

  const handleUnauthorized = async () => {
    if (handledUnauthorizedRef.current) {
      return;
    }

    handledUnauthorizedRef.current = true;
    resetAll();
    await logout();
    toast.error("Your session expired. Please log in again.");
    router.push("/login?next=%2Fupload");
  };

  const clearPoll = (entryId: string) => {
    const timeoutId = pollTimeoutMapRef.current.get(entryId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      pollTimeoutMapRef.current.delete(entryId);
    }
  };

  const finalizeSuccess = (entry: UploadEntry, result: { cid: string; originalFilename?: string; size?: number; uploadedAt?: string }) => {
    clearPoll(entry.id);
    xhrMapRef.current.delete(entry.id);

    const uploadedAt = result.uploadedAt ?? new Date().toISOString();

    updateEntry(entry.id, {
      status: "done",
      progress: 100,
      cid: result.cid,
      uploadedAt,
      error: undefined,
      serverMessage: "Upload completed",
    });

    const historyEntry: UploadHistoryEntry = {
      id: entry.id,
      filename: result.originalFilename ?? entry.file.name,
      cid: result.cid,
      size: result.size ?? entry.file.size,
      uploadedAt,
    };
    addHistory(historyEntry);
  };

  const startPolling = (entryId: string, taskId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/upload/status/${taskId}`, {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json().catch(() => null)) as RouteEnvelope<UploadStatusPayload> | null;

        if (response.status === 401) {
          await handleUnauthorized();
          return;
        }

        if (!response.ok || !payload?.data) {
          updateEntry(entryId, {
            status: "error",
            error: payload?.message ?? "Unable to retrieve the server-side upload status.",
            serverMessage: undefined,
          });
          return;
        }

        if (payload.data.phase === "done" && payload.data.result?.cid) {
          const current = entriesRef.current.find((entry) => entry.id === entryId);
          if (current) {
            finalizeSuccess(current, payload.data.result);
          }
          return;
        }

        updateEntry(entryId, {
          status: "processing",
          progress: payload.data.progress,
          serverMessage: payload.data.message ?? "Processing upload on the server",
        });

        const timeoutId = window.setTimeout(() => {
          void poll();
        }, 1500);
        pollTimeoutMapRef.current.set(entryId, timeoutId);
      } catch {
        updateEntry(entryId, {
          status: "error",
          error: "Unable to reach the upload status endpoint.",
          serverMessage: undefined,
        });
      }
    };

    void poll();
  };

  const uploadOne = useEffectEvent((entry: UploadEntry) => {
    if (xhrMapRef.current.has(entry.id)) {
      return;
    }

    const xhr = new XMLHttpRequest();
    xhrMapRef.current.set(entry.id, xhr);

    updateEntry(entry.id, {
      status: "uploading",
      progress: 0,
      error: undefined,
      serverMessage: "Uploading to the gateway",
    });

    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      updateEntry(entry.id, {
        progress: Math.min(Math.round((event.loaded / event.total) * 100), 98),
      });
    };

    xhr.onerror = () => {
      xhrMapRef.current.delete(entry.id);
      updateEntry(entry.id, {
        status: "error",
        error: "Upload failed because the network request could not be completed.",
        serverMessage: undefined,
      });
    };

    xhr.onabort = () => {
      xhrMapRef.current.delete(entry.id);
      clearPoll(entry.id);
      updateEntry(entry.id, {
        status: "cancelled",
        progress: 0,
        error: undefined,
        serverMessage: "Upload cancelled",
      });
    };

    xhr.onload = () => {
      xhrMapRef.current.delete(entry.id);
      const payload = readJsonPayload<RouteEnvelope<UploadRoutePayload>>(xhr.responseText);

      if (xhr.status === 401) {
        void handleUnauthorized();
        return;
      }

      if (xhr.status === 201 && payload?.data?.cid) {
        finalizeSuccess(entry, {
          cid: payload.data.cid,
          originalFilename: payload.data.originalFilename,
          size: payload.data.size,
          uploadedAt: payload.data.uploadedAt,
        });
        return;
      }

      if (xhr.status === 202 && payload?.data?.taskId) {
        updateEntry(entry.id, {
          status: "processing",
          progress: 100,
          taskId: payload.data.taskId,
          error: undefined,
          serverMessage: payload.message ?? "Upload transferred. Server-side processing continues.",
        });
        startPolling(entry.id, payload.data.taskId);
        return;
      }

      updateEntry(entry.id, {
        status: "error",
        progress: 0,
        error: payload?.message ?? "Upload failed.",
        serverMessage: undefined,
      });
    };

    const formData = new FormData();
    formData.append("file", entry.file);
    xhr.send(formData);
  });

  useEffect(() => {
    const activeUploads = entries.filter((entry) => entry.status === "uploading").length;
    if (activeUploads >= MAX_CONCURRENT_FILES) {
      return;
    }

    const queuedEntries = entries.filter((entry) => entry.status === "queued");
    for (const entry of queuedEntries.slice(0, MAX_CONCURRENT_FILES - activeUploads)) {
      uploadOne(entry);
    }
  }, [entries]);

  const enqueue = (files: File[]) => {
    const validation = validateBatch(files);
    if (validation.errors.length > 0) {
      for (const error of validation.errors) {
        toast.error(error);
      }
    }

    if (validation.validFiles.length === 0) {
      return validation.errors;
    }

    addEntries(
      validation.validFiles.map((file) => ({
        id: createUploadId(),
        file,
        status: "queued",
        progress: 0,
        serverMessage: "Queued for upload",
      })),
    );

    return validation.errors;
  };

  const cancel = (id: string) => {
    const entry = entriesRef.current.find((candidate) => candidate.id === id);
    if (!entry) {
      return;
    }

    const xhr = xhrMapRef.current.get(id);
    if (xhr) {
      xhr.abort();
      return;
    }

    clearPoll(id);
    updateEntry(id, {
      status: "cancelled",
      progress: 0,
      serverMessage: "Upload cancelled",
      error: undefined,
    });
  };

  const retry = (id: string) => {
    clearPoll(id);
    xhrMapRef.current.delete(id);
    updateEntry(id, {
      status: "queued",
      progress: 0,
      cid: undefined,
      taskId: undefined,
      uploadedAt: undefined,
      error: undefined,
      serverMessage: "Queued for retry",
    });
  };

  const remove = (id: string) => {
    clearPoll(id);

    const xhr = xhrMapRef.current.get(id);
    if (xhr) {
      xhr.abort();
    }

    xhrMapRef.current.delete(id);
    removeEntry(id);
  };

  return {
    entries,
    history,
    enqueue,
    cancel,
    retry,
    remove,
    clearHistory,
    activeUploads: entries.filter((entry) => entry.status === "uploading" || entry.status === "processing").length,
  };
}
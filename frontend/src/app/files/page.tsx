"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Copy, Download, ExternalLink, Eye, Grid3X3, List, Pin, PinOff, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEFAULT_FILES_QUERY,
  formatDate,
  formatFileSize,
  mergePinnedState,
  nextSort,
  truncateCid,
  type FilesMeta,
  type FilesQueryState,
  type FilesViewMode,
  type PinnedFilter,
} from "@/lib/files-management";
import { toast } from "@/lib/toast";
import type { FileInfo } from "@/types/file";

class RequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
  }
}

function parseRetryAfterSeconds(headers: Headers): number | undefined {
  const raw = headers.get("retry-after");
  if (!raw) {
    return undefined;
  }
  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && asNumber >= 0) {
    return asNumber;
  }
  return undefined;
}

function notifyRequestError(error: unknown, fallback: string) {
  if (error instanceof RequestError && error.status === 429 && error.retryAfterSeconds) {
    toast.warning(`Rate limit exceeded. Retry in ${error.retryAfterSeconds}s.`);
    return;
  }

  toast.error(error instanceof Error ? error.message : fallback);
}

type FilesResponse = {
  data: FileInfo[];
  meta: FilesMeta;
};

type PreviewKind = "image" | "video" | "text" | "file";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov", "m4v"]);
const TEXT_EXTENSIONS = new Set(["txt", "md", "csv", "json", "xml", "log", "yaml", "yml", "js", "ts", "tsx", "py", "html", "css"]);

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const MAX_TEXT_PREVIEW_BYTES = 256 * 1024;

function isTextPreviewMime(mimeType?: string): boolean {
  const normalized = (mimeType ?? "").toLowerCase();
  return (
    normalized.startsWith("text/")
    || normalized === "application/json"
    || normalized === "application/xml"
    || normalized === "application/javascript"
  );
}

function buildRetrieveUrl(cid: string): string {
  return `/api/retrieve/${encodeURIComponent(cid)}`;
}

function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  if (parts.length < 2) {
    return "";
  }
  return parts[parts.length - 1] ?? "";
}

function getPreviewKind(mimeType: string | undefined, filename: string): PreviewKind {
  const normalized = (mimeType ?? "").toLowerCase();
  if (normalized.startsWith("image/")) {
    return "image";
  }
  if (normalized.startsWith("video/")) {
    return "video";
  }
  if (isTextPreviewMime(normalized)) {
    return "text";
  }

  const extension = getFileExtension(filename);
  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }
  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }
  if (TEXT_EXTENSIONS.has(extension)) {
    return "text";
  }

  return "file";
}

function GridFilePreview({ file }: { file: FileInfo }) {
  const previewKind = getPreviewKind(file.content_type, file.original_filename);
  const isImage = previewKind === "image";
  const isVideo = previewKind === "video";
  const isText = previewKind === "text";
  const previewUrl = buildRetrieveUrl(file.cid);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [textPreviewError, setTextPreviewError] = useState(false);

  useEffect(() => {
    if (!isText || file.size > MAX_TEXT_PREVIEW_BYTES) {
      const rafId = window.requestAnimationFrame(() => {
        setTextPreview(null);
        setTextPreviewError(false);
      });
      return () => window.cancelAnimationFrame(rafId);
    }

    const resetRafId = window.requestAnimationFrame(() => {
      setTextPreview(null);
      setTextPreviewError(false);
    });

    const controller = new AbortController();

    void fetch(previewUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Text preview not available");
        }
        const body = await response.text();
        const compact = body.replace(/\s+/g, " ").trim();
        setTextPreview(compact.slice(0, 220) || "(empty text file)");
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === "AbortError") {
          return;
        }
        setTextPreviewError(true);
      });

    return () => {
      window.cancelAnimationFrame(resetRafId);
      controller.abort();
    };
  }, [file.size, isText, previewUrl]);

  if (isImage) {
    return (
      <img
        alt={`Preview of ${file.original_filename}`}
        className="h-20 w-full rounded-md bg-slate-100 object-cover"
        loading="lazy"
        src={previewUrl}
      />
    );
  }

  if (isVideo) {
    return (
      <video
        aria-label={`Preview of ${file.original_filename}`}
        className="h-20 w-full rounded-md bg-slate-100 object-cover"
        controls
        muted
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= 15) {
            event.currentTarget.pause();
          }
        }}
        playsInline
        preload="metadata"
        src={`${previewUrl}#t=0,15`}
      />
    );
  }

  if (isText) {
    if (file.size > MAX_TEXT_PREVIEW_BYTES) {
      return (
        <div className="flex h-20 items-center justify-center rounded-md bg-slate-100 px-3 text-center text-xs text-slate-500">
          Text preview unavailable for files larger than 256 KB.
        </div>
      );
    }

    return (
      <div className="h-20 overflow-hidden rounded-md bg-slate-100 p-2">
        {textPreviewError ? (
          <p className="text-xs text-slate-500">Text preview unavailable.</p>
        ) : textPreview === null ? (
          <p className="text-xs text-slate-500">Loading text preview...</p>
        ) : (
          <p aria-label={`Preview text for ${file.original_filename}`} className="line-clamp-4 break-words text-xs text-slate-700">
            {textPreview}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-20 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-500">
      No preview
    </div>
  );
}

function buildQueryParams(query: FilesQueryState): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("page_size", String(query.pageSize));
  params.set("sort_by", query.sortBy);
  params.set("sort_order", query.sortOrder);
  params.set("pinned", query.pinned);
  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  return params.toString();
}

async function fetchFiles(query: FilesQueryState): Promise<FilesResponse> {
  const response = await fetch(`/api/files?${buildQueryParams(query)}`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        message?: string;
        data?: FileInfo[];
        meta?: FilesMeta;
      }
    | null;

  if (!response.ok) {
    throw new RequestError(
      payload?.message ?? "Unable to load files",
      response.status,
      parseRetryAfterSeconds(response.headers),
    );
  }

  return {
    data: payload?.data ?? [],
    meta:
      payload?.meta ??
      ({
        page: query.page,
        page_size: query.pageSize,
        total: 0,
        total_pages: 1,
        sort_by: query.sortBy,
        sort_order: query.sortOrder,
        search: query.search,
        pinned: query.pinned,
      } as FilesMeta),
  };
}

async function setPinState(cid: string, targetPinned: boolean): Promise<void> {
  const response = await fetch(`/api/files/${encodeURIComponent(cid)}/pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetPinned }),
  });

  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new RequestError(
      payload?.message ?? "Unable to update pin state",
      response.status,
      parseRetryAfterSeconds(response.headers),
    );
  }
}

async function deleteSingleFile(cid: string): Promise<void> {
  const response = await fetch(`/api/files/${encodeURIComponent(cid)}`, {
    method: "DELETE",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new RequestError(
      payload?.message ?? "Unable to delete file",
      response.status,
      parseRetryAfterSeconds(response.headers),
    );
  }
}

async function deleteBulkFiles(cids: string[]): Promise<void> {
  const response = await fetch("/api/files/delete/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cids }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new RequestError(
      payload?.message ?? "Unable to delete selected files",
      response.status,
      parseRetryAfterSeconds(response.headers),
    );
  }
}

export default function FilesPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<FilesViewMode>("list");
  const [query, setQuery] = useState<FilesQueryState>(DEFAULT_FILES_QUERY);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCids, setSelectedCids] = useState<string[]>([]);
  const [detailsFile, setDetailsFile] = useState<FileInfo | null>(null);
  const [confirmSingleDelete, setConfirmSingleDelete] = useState<FileInfo | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const filesQuery = useQuery({
    queryKey: ["files-management", query],
    queryFn: () => fetchFiles(query),
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
  });

  const files = useMemo(() => filesQuery.data?.data ?? [], [filesQuery.data?.data]);
  const meta = filesQuery.data?.meta;
  const allVisibleSelected = files.length > 0 && files.every((file) => selectedCids.includes(file.cid));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery((previous) => ({ ...previous, page: 1, search: searchInput }));
      setSelectedCids([]);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const pinMutation = useMutation({
    mutationFn: ({ cid, targetPinned }: { cid: string; targetPinned: boolean }) => setPinState(cid, targetPinned),
    onMutate: async ({ cid, targetPinned }) => {
      await queryClient.cancelQueries({ queryKey: ["files-management"] });
      const previousData = queryClient.getQueriesData<FilesResponse>({ queryKey: ["files-management"] });

      for (const [key, value] of previousData) {
        if (!value) {
          continue;
        }
        queryClient.setQueryData<FilesResponse>(key, {
          ...value,
          data: value.data.map((file) => (file.cid === cid ? { ...file, pinned: targetPinned } : file)),
        });
      }

      return { previousData };
    },
    onError: (error, _variables, context) => {
      for (const [key, value] of context?.previousData ?? []) {
        queryClient.setQueryData(key, value);
      }
      notifyRequestError(error, "Unable to update pin state");
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.targetPinned ? "Pin request queued" : "Unpin request queued");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["files-management"] });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ cids, targetPinned }: { cids: string[]; targetPinned: boolean }) => {
      await Promise.all(cids.map((cid) => setPinState(cid, targetPinned)));
    },
    onMutate: async ({ cids, targetPinned }) => {
      await queryClient.cancelQueries({ queryKey: ["files-management"] });
      const previousData = queryClient.getQueriesData<FilesResponse>({ queryKey: ["files-management"] });

      for (const [key, value] of previousData) {
        if (!value) {
          continue;
        }
        queryClient.setQueryData<FilesResponse>(key, {
          ...value,
          data: mergePinnedState(value.data, cids, targetPinned),
        });
      }

      return { previousData };
    },
    onError: (error, _variables, context) => {
      for (const [key, value] of context?.previousData ?? []) {
        queryClient.setQueryData(key, value);
      }
      notifyRequestError(error, "Bulk action failed");
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.targetPinned ? "Bulk pin queued" : "Bulk unpin queued");
      setSelectedCids([]);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["files-management"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ cid }: { cid: string }) => deleteSingleFile(cid),
    onMutate: async ({ cid }) => {
      await queryClient.cancelQueries({ queryKey: ["files-management"] });
      const previousData = queryClient.getQueriesData<FilesResponse>({ queryKey: ["files-management"] });

      for (const [key, value] of previousData) {
        if (!value) {
          continue;
        }
        queryClient.setQueryData<FilesResponse>(key, {
          ...value,
          data: value.data.filter((file) => file.cid !== cid),
          meta: {
            ...value.meta,
            total: Math.max(0, value.meta.total - 1),
          },
        });
      }

      return { previousData };
    },
    onError: (error, _variables, context) => {
      for (const [key, value] of context?.previousData ?? []) {
        queryClient.setQueryData(key, value);
      }
      notifyRequestError(error, "Delete failed");
    },
    onSuccess: (_data, variables) => {
      toast.success("File deleted successfully");
      setDetailsFile(null);
      setSelectedCids((previous) => previous.filter((cid) => cid !== variables.cid));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["files-management"] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: ({ cids }: { cids: string[] }) => deleteBulkFiles(cids),
    onMutate: async ({ cids }) => {
      await queryClient.cancelQueries({ queryKey: ["files-management"] });
      const previousData = queryClient.getQueriesData<FilesResponse>({ queryKey: ["files-management"] });

      for (const [key, value] of previousData) {
        if (!value) {
          continue;
        }
        queryClient.setQueryData<FilesResponse>(key, {
          ...value,
          data: value.data.filter((file) => !cids.includes(file.cid)),
          meta: {
            ...value.meta,
            total: Math.max(0, value.meta.total - cids.length),
          },
        });
      }

      return { previousData };
    },
    onError: (error, _variables, context) => {
      for (const [key, value] of context?.previousData ?? []) {
        queryClient.setQueryData(key, value);
      }
      notifyRequestError(error, "Bulk delete failed");
    },
    onSuccess: (_data, variables) => {
      toast.success(`${variables.cids.length} file(s) deleted`);
      setSelectedCids([]);
      if (detailsFile && variables.cids.includes(detailsFile.cid)) {
        setDetailsFile(null);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["files-management"] });
    },
  });

  const selectedFiles = useMemo(() => {
    const selectedSet = new Set(selectedCids);
    return files.filter((file) => selectedSet.has(file.cid));
  }, [files, selectedCids]);

  const toggleRowSelection = (cid: string) => {
    setSelectedCids((previous) => (previous.includes(cid) ? previous.filter((value) => value !== cid) : [...previous, cid]));
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedCids([]);
      return;
    }
    setSelectedCids(files.map((file) => file.cid));
  };

  const onSort = (requested: "name" | "size" | "uploaded" | "pinned") => {
    setSelectedCids([]);
    setQuery((previous) => {
      const next = nextSort({ sortBy: previous.sortBy, sortOrder: previous.sortOrder }, requested);
      return {
        ...previous,
        page: 1,
        sortBy: next.sortBy,
        sortOrder: next.sortOrder,
      };
    });
  };

  const copyCid = async (cid: string) => {
    try {
      await navigator.clipboard.writeText(cid);
      toast.success("CID copied");
    } catch {
      toast.error("Unable to copy CID");
    }
  };

  const onDownload = (cid: string) => {
    const link = document.createElement("a");
    link.href = `/api/retrieve/${encodeURIComponent(cid)}?download=1`;
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    link.click();
  };

  const onDeleteSingle = (file: FileInfo) => {
    setConfirmSingleDelete(file);
  };

  const onDeleteBulk = () => {
    if (selectedCids.length === 0) {
      return;
    }
    setConfirmBulkDelete(true);
  };

  const confirmSingleDeletion = () => {
    if (!confirmSingleDelete) {
      return;
    }
    deleteMutation.mutate({ cid: confirmSingleDelete.cid });
    setConfirmSingleDelete(null);
  };

  const confirmBulkDeletion = () => {
    bulkDeleteMutation.mutate({ cids: selectedCids });
    setConfirmBulkDelete(false);
  };

  const isBusy = pinMutation.isPending || bulkMutation.isPending || deleteMutation.isPending || bulkDeleteMutation.isPending;
  const currentPage = meta?.page ?? query.page;
  const currentPageSize = meta?.page_size ?? query.pageSize;
  const rangeStart = files.length === 0 ? 0 : (currentPage - 1) * currentPageSize + 1;
  const rangeEnd = files.length === 0 ? 0 : (currentPage - 1) * currentPageSize + files.length;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Files</h1>
            <p className="mt-1 text-sm text-slate-600">Search, sort, pin, and inspect uploaded files from one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "primary" : "ghost"}>
              <List className="mr-2 h-4 w-4" />
              List
            </Button>
            <Button onClick={() => setViewMode("grid")} variant={viewMode === "grid" ? "primary" : "ghost"}>
              <Grid3X3 className="mr-2 h-4 w-4" />
              Grid
            </Button>
          </div>
        </div>

        <Card className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr]">
            <label className="relative block" htmlFor="search-files">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                id="search-files"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by filename or CID"
                value={searchInput}
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Pinned</span>
              <select
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
                onChange={(event) => {
                  setSelectedCids([]);
                  setQuery((previous) => ({ ...previous, page: 1, pinned: event.target.value as PinnedFilter }));
                }}
                value={query.pinned}
              >
                <option value="all">All files</option>
                <option value="true">Pinned only</option>
                <option value="false">Unpinned only</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Page size</span>
              <select
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
                onChange={(event) => {
                  setSelectedCids([]);
                  setQuery((previous) => ({ ...previous, page: 1, pageSize: Number(event.target.value) }));
                }}
                value={query.pageSize}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={selectedCids.length === 0 || isBusy}
              onClick={() => bulkMutation.mutate({ cids: selectedCids, targetPinned: true })}
              variant="ghost"
            >
              <Pin className="mr-2 h-4 w-4" />
              Pin selected
            </Button>
            <Button
              disabled={selectedCids.length === 0 || isBusy}
              onClick={() => bulkMutation.mutate({ cids: selectedCids, targetPinned: false })}
              variant="ghost"
            >
              <PinOff className="mr-2 h-4 w-4" />
              Unpin selected
            </Button>
            <Button disabled={selectedCids.length === 0 || isBusy} onClick={() => setSelectedCids([])} variant="ghost">
              Clear selection ({selectedCids.length})
            </Button>
            <Button disabled={selectedCids.length === 0 || isBusy} onClick={onDeleteBulk} variant="ghost">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete selected
            </Button>
          </div>
        </Card>

        {filesQuery.isError ? (
          <Card className="border-rose-200 bg-rose-50">
            <p className="font-semibold text-rose-800">Unable to load files</p>
            <p className="mt-1 text-sm text-rose-700">{filesQuery.error instanceof Error ? filesQuery.error.message : "Unexpected error"}</p>
            <Button className="mt-3" onClick={() => void filesQuery.refetch()} variant="ghost">
              Retry
            </Button>
          </Card>
        ) : null}

        {filesQuery.isLoading && files.length === 0 ? (
          <Card className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </Card>
        ) : null}

        {!filesQuery.isError && files.length === 0 && !filesQuery.isLoading ? (
          <EmptyState
            description="Upload your first file to start managing content here."
            title="No files yet"
          />
        ) : null}

        {!filesQuery.isError && files.length > 0 ? (
          <>
            {viewMode === "list" ? (
              <Card className="overflow-x-auto p-0">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-600">
                      <th className="px-4 py-3">
                        <input aria-label="Select all files" checked={allVisibleSelected} onChange={toggleSelectAllVisible} type="checkbox" />
                      </th>
                      <th className="px-4 py-3">
                        <button onClick={() => onSort("name")} type="button">
                          Name
                        </button>
                      </th>
                      <th className="px-4 py-3">CID</th>
                      <th className="px-4 py-3">
                        <button onClick={() => onSort("size")} type="button">
                          Size
                        </button>
                      </th>
                      <th className="px-4 py-3">
                        <button onClick={() => onSort("pinned")} type="button">
                          Pinned
                        </button>
                      </th>
                      <th className="px-4 py-3">
                        <button onClick={() => onSort("uploaded")} type="button">
                          Uploaded
                        </button>
                      </th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => {
                      const rowSelected = selectedCids.includes(file.cid);
                      return (
                        <tr className="border-t border-slate-200 text-sm" key={file.cid}>
                          <td className="px-4 py-3">
                            <input aria-label={`Select ${file.original_filename}`} checked={rowSelected} onChange={() => toggleRowSelection(file.cid)} type="checkbox" />
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{file.original_filename}</td>
                          <td className="px-4 py-3 text-slate-700">
                            <div className="inline-flex items-center gap-2">
                              <code>{truncateCid(file.cid)}</code>
                              <Button className="h-7 px-2" onClick={() => void copyCid(file.cid)} variant="ghost">
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{formatFileSize(file.size)}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs ${file.pinned ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                              {file.pinned ? "Pinned" : "Unpinned"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{formatDate(file.uploaded_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button aria-label={`Download ${file.original_filename}`} className="h-8 px-2" onClick={() => onDownload(file.cid)} variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                              <a
                                aria-label={`Open ${file.original_filename} on IPFS.io`}
                                className="inline-flex h-8 items-center justify-center rounded-md bg-transparent px-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                href={`https://ipfs.io/ipfs/${file.cid}`}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                              <Button aria-label={`Open details for ${file.original_filename}`} className="h-8 px-2" onClick={() => setDetailsFile(file)} variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                aria-label={`${file.pinned ? "Unpin" : "Pin"} ${file.original_filename}`}
                                className="h-8 px-2"
                                disabled={isBusy}
                                onClick={() => pinMutation.mutate({ cid: file.cid, targetPinned: !file.pinned })}
                                variant="ghost"
                              >
                                {file.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                              </Button>
                              <Button
                                aria-label={`Delete ${file.original_filename}`}
                                className="h-8 px-2"
                                disabled={isBusy}
                                onClick={() => onDeleteSingle(file)}
                                variant="ghost"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {files.map((file) => {
                  const selected = selectedCids.includes(file.cid);
                  const previewKind = getPreviewKind(file.content_type, file.original_filename);
                  const previewLabel = previewKind.charAt(0).toUpperCase() + previewKind.slice(1);
                  return (
                    <Card className="space-y-3" key={file.cid}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{file.original_filename}</p>
                          <p className="truncate text-xs text-slate-600">{truncateCid(file.cid)}</p>
                          <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700" aria-label={`Preview type ${previewLabel} for ${file.original_filename}`}>
                            {previewLabel}
                          </span>
                        </div>
                        <button aria-label={`Select ${file.original_filename}`} className={`rounded border p-1 ${selected ? "border-emerald-500 bg-emerald-50" : "border-slate-300"}`} onClick={() => toggleRowSelection(file.cid)} type="button">
                          <Check className={`h-3 w-3 ${selected ? "text-emerald-700" : "text-slate-400"}`} />
                        </button>
                      </div>

                      <GridFilePreview file={file} />

                      <div className="space-y-1 text-xs text-slate-600">
                        <p>Size: {formatFileSize(file.size)}</p>
                        <p>Uploaded: {formatDate(file.uploaded_at)}</p>
                        <p>Status: {file.pinned ? "Pinned" : "Unpinned"}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button aria-label={`Download ${file.original_filename}`} className="h-8 px-2" onClick={() => onDownload(file.cid)} variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        <a
                          aria-label={`Open ${file.original_filename} on IPFS.io`}
                          className="inline-flex h-8 items-center justify-center rounded-md bg-transparent px-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          href={`https://ipfs.io/ipfs/${file.cid}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Button aria-label={`Open details for ${file.original_filename}`} className="h-8 px-2" onClick={() => setDetailsFile(file)} variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button aria-label={`Copy CID for ${file.original_filename}`} className="h-8 px-2" onClick={() => void copyCid(file.cid)} variant="ghost">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          aria-label={`${file.pinned ? "Unpin" : "Pin"} ${file.original_filename}`}
                          className="h-8 px-2"
                          disabled={isBusy}
                          onClick={() => pinMutation.mutate({ cid: file.cid, targetPinned: !file.pinned })}
                          variant="ghost"
                        >
                          {file.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        </Button>
                        <Button
                          aria-label={`Delete ${file.original_filename}`}
                          className="h-8 px-2"
                          disabled={isBusy}
                          onClick={() => onDeleteSingle(file)}
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            <Card className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-700">
                Showing {rangeStart}-{rangeEnd} of {meta?.total ?? files.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={(meta?.page ?? query.page) <= 1 || filesQuery.isLoading}
                  onClick={() => {
                    setSelectedCids([]);
                    setQuery((previous) => ({ ...previous, page: Math.max(1, previous.page - 1) }));
                  }}
                  variant="ghost"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-700">
                  Page {meta?.page ?? query.page} / {meta?.total_pages ?? 1}
                </span>
                <Button
                  disabled={(meta?.page ?? query.page) >= (meta?.total_pages ?? 1) || filesQuery.isLoading}
                  onClick={() => {
                    setSelectedCids([]);
                    setQuery((previous) => ({ ...previous, page: previous.page + 1 }));
                  }}
                  variant="ghost"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </>
        ) : null}

        {detailsFile ? (
          <div aria-label="File details drawer" className="fixed inset-0 z-40 flex justify-end bg-slate-900/40" role="dialog">
            <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">File Details</h2>
                <Button onClick={() => setDetailsFile(null)} variant="ghost">
                  Close
                </Button>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-slate-700">Name</dt>
                  <dd className="break-all text-slate-900">{detailsFile.original_filename}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">CID</dt>
                  <dd className="break-all text-slate-900">{detailsFile.cid}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Size</dt>
                  <dd className="text-slate-900">{formatFileSize(detailsFile.size)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Uploaded</dt>
                  <dd className="text-slate-900">{formatDate(detailsFile.uploaded_at)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Pinned</dt>
                  <dd className="text-slate-900">{detailsFile.pinned ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">MIME type</dt>
                  <dd className="text-slate-900">{detailsFile.content_type ?? "Unknown"}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => onDownload(detailsFile.cid)} variant="ghost">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={() => void copyCid(detailsFile.cid)} variant="ghost">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy CID
                </Button>
                <Button
                  disabled={isBusy}
                  onClick={() => pinMutation.mutate({ cid: detailsFile.cid, targetPinned: !detailsFile.pinned })}
                  variant="ghost"
                >
                  {detailsFile.pinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                  {detailsFile.pinned ? "Unpin" : "Pin"}
                </Button>
                <Button disabled={isBusy} onClick={() => onDeleteSingle(detailsFile)} variant="ghost">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {filesQuery.isLoading ? (
          <Card>
            <p className="text-sm text-slate-600">Loading files...</p>
          </Card>
        ) : null}

        {!filesQuery.isLoading && selectedFiles.length > 0 ? (
          <p className="text-xs text-slate-500">{selectedFiles.length} file(s) selected for bulk actions.</p>
        ) : null}

        <ConfirmDialog
          cancelLabel="Cancel"
          confirmLabel="Delete"
          description={
            confirmSingleDelete
              ? `Delete ${confirmSingleDelete.original_filename}? This action cannot be undone from the UI.`
              : ""
          }
          onCancel={() => setConfirmSingleDelete(null)}
          onConfirm={confirmSingleDeletion}
          open={Boolean(confirmSingleDelete)}
          title="Delete file"
        />

        <ConfirmDialog
          cancelLabel="Cancel"
          confirmLabel={`Delete ${selectedCids.length} file(s)`}
          description={`Delete ${selectedCids.length} selected file(s)? This action cannot be undone from the UI.`}
          onCancel={() => setConfirmBulkDelete(false)}
          onConfirm={confirmBulkDeletion}
          open={confirmBulkDelete}
          title="Delete selected files"
        />
      </div>
    </ProtectedRoute>
  );
}

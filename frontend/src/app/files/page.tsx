"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Copy, Download, Eye, Grid3X3, List, Pin, PinOff, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { FileInfo } from "@/types/file";

type FilesResponse = {
  data: FileInfo[];
  meta: FilesMeta;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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
    throw new Error(payload?.message ?? "Unable to load files");
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
    throw new Error(payload?.message ?? "Unable to update pin state");
  }
}

export default function FilesPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<FilesViewMode>("list");
  const [query, setQuery] = useState<FilesQueryState>(DEFAULT_FILES_QUERY);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCids, setSelectedCids] = useState<string[]>([]);
  const [detailsFile, setDetailsFile] = useState<FileInfo | null>(null);

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
      toast.error(error instanceof Error ? error.message : "Unable to update pin state");
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
      toast.error(error instanceof Error ? error.message : "Bulk action failed");
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.targetPinned ? "Bulk pin queued" : "Bulk unpin queued");
      setSelectedCids([]);
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

  const isBusy = pinMutation.isPending || bulkMutation.isPending;
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

        {!filesQuery.isError && files.length === 0 && !filesQuery.isLoading ? (
          <Card className="text-center">
            <p className="text-lg font-semibold text-slate-900">No files yet</p>
            <p className="mt-2 text-sm text-slate-600">Upload your first file to start managing content here.</p>
          </Card>
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
                  return (
                    <Card className="space-y-3" key={file.cid}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{file.original_filename}</p>
                          <p className="truncate text-xs text-slate-600">{truncateCid(file.cid)}</p>
                        </div>
                        <button aria-label={`Select ${file.original_filename}`} className={`rounded border p-1 ${selected ? "border-emerald-500 bg-emerald-50" : "border-slate-300"}`} onClick={() => toggleRowSelection(file.cid)} type="button">
                          <Check className={`h-3 w-3 ${selected ? "text-emerald-700" : "text-slate-400"}`} />
                        </button>
                      </div>

                      <div className="flex h-20 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-500">
                        {file.content_type?.startsWith("image/") ? "Image" : "File"}
                      </div>

                      <div className="space-y-1 text-xs text-slate-600">
                        <p>Size: {formatFileSize(file.size)}</p>
                        <p>Uploaded: {formatDate(file.uploaded_at)}</p>
                        <p>Status: {file.pinned ? "Pinned" : "Unpinned"}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button aria-label={`Download ${file.original_filename}`} className="h-8 px-2" onClick={() => onDownload(file.cid)} variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
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
      </div>
    </ProtectedRoute>
  );
}

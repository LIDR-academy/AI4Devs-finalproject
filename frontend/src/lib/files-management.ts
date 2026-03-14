import type { FileInfo } from "@/types/file";

export type FilesViewMode = "list" | "grid";
export type PinnedFilter = "all" | "true" | "false";
export type SortKey = "name" | "size" | "uploaded" | "pinned";
export type SortOrder = "asc" | "desc";

export type FilesQueryState = {
  page: number;
  pageSize: number;
  search: string;
  pinned: PinnedFilter;
  sortBy: SortKey;
  sortOrder: SortOrder;
};

export type FilesMeta = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  sort_by: SortKey;
  sort_order: SortOrder;
  search: string;
  pinned: PinnedFilter;
};

export const DEFAULT_FILES_QUERY: FilesQueryState = {
  page: 1,
  pageSize: 10,
  search: "",
  pinned: "all",
  sortBy: "uploaded",
  sortOrder: "desc",
};

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Unknown";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value.toFixed(1)} ${unit}`;
}

export function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }
  return parsed.toLocaleString();
}

export function truncateCid(cid: string): string {
  if (cid.length <= 14) {
    return cid;
  }
  return `${cid.slice(0, 8)}...${cid.slice(-6)}`;
}

export function nextSort(current: { sortBy: SortKey; sortOrder: SortOrder }, requested: SortKey): { sortBy: SortKey; sortOrder: SortOrder } {
  if (current.sortBy !== requested) {
    return { sortBy: requested, sortOrder: "asc" };
  }
  return { sortBy: requested, sortOrder: current.sortOrder === "asc" ? "desc" : "asc" };
}

export function mergePinnedState(files: FileInfo[], selectedCids: string[], targetPinned: boolean): FileInfo[] {
  const selected = new Set(selectedCids);
  return files.map((file) => (selected.has(file.cid) ? { ...file, pinned: targetPinned } : file));
}

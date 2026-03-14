import {
  DEFAULT_FILES_QUERY,
  formatDate,
  formatFileSize,
  mergePinnedState,
  nextSort,
  truncateCid,
} from "@/lib/files-management";

describe("files-management utilities", () => {
  test("exposes expected default query state", () => {
    expect(DEFAULT_FILES_QUERY).toEqual({
      page: 1,
      pageSize: 10,
      search: "",
      pinned: "all",
      sortBy: "uploaded",
      sortOrder: "desc",
    });
  });

  test("formatFileSize handles invalid and byte-sized values", () => {
    expect(formatFileSize(Number.NaN)).toBe("Unknown");
    expect(formatFileSize(-1)).toBe("Unknown");
    expect(formatFileSize(512)).toBe("512 B");
  });

  test("formatFileSize scales through KB and MB", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
  });

  test("formatDate returns fallback for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("Unknown");
  });

  test("truncateCid keeps short values and compresses long ones", () => {
    expect(truncateCid("bafyshortcid")).toBe("bafyshortcid");
    expect(truncateCid("bafybeigdyrzt6x7x6m4mkexamplecid")).toBe("bafybeig...plecid");
  });

  test("nextSort changes key then toggles sort order", () => {
    expect(nextSort({ sortBy: "uploaded", sortOrder: "desc" }, "name")).toEqual({
      sortBy: "name",
      sortOrder: "asc",
    });
    expect(nextSort({ sortBy: "name", sortOrder: "asc" }, "name")).toEqual({
      sortBy: "name",
      sortOrder: "desc",
    });
    expect(nextSort({ sortBy: "name", sortOrder: "desc" }, "name")).toEqual({
      sortBy: "name",
      sortOrder: "asc",
    });
  });

  test("mergePinnedState updates only selected cids", () => {
    const files = [
      {
        cid: "cid-1",
        original_filename: "one.txt",
        size: 10,
        pinned: false,
        uploaded_at: "2026-03-14T12:00:00.000Z",
        content_type: "text/plain",
      },
      {
        cid: "cid-2",
        original_filename: "two.txt",
        size: 20,
        pinned: false,
        uploaded_at: "2026-03-14T12:00:00.000Z",
        content_type: "text/plain",
      },
    ];

    expect(mergePinnedState(files, ["cid-2"], true)).toEqual([
      expect.objectContaining({ cid: "cid-1", pinned: false }),
      expect.objectContaining({ cid: "cid-2", pinned: true }),
    ]);
  });
});

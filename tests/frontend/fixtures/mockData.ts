export type MockFileItem = {
  cid: string;
  original_filename: string;
  size: number;
  pinned: boolean;
  uploaded_at: string;
  content_type: string | null;
};

export function createMockFile(overrides: Partial<MockFileItem> = {}): MockFileItem {
  return {
    cid: "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca",
    original_filename: "sample.txt",
    size: 1024,
    pinned: false,
    uploaded_at: "2026-03-13T10:00:00.000Z",
    content_type: "text/plain",
    ...overrides,
  };
}

export function createMockFiles(count: number): MockFileItem[] {
  return Array.from({ length: count }, (_, index) =>
    createMockFile({
      cid: `bafy-mock-cid-${index + 1}`,
      original_filename: `file-${index + 1}.txt`,
      size: 1024 * (index + 1),
      pinned: index % 2 === 0,
      uploaded_at: new Date(2026, 2, 13, 10, index).toISOString(),
    }),
  );
}

export const mockUserSession = {
  status: 200,
  data: {
    email: "qa@example.com",
    apiKeyStatus: "active",
    createdAt: "2026-03-13T09:00:00.000Z",
    lastRenewedAt: null,
    usageCount: 12,
  },
};

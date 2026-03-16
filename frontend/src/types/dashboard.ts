type ApiKeyStatus = "active" | "inactive" | "revoked";

export type DashboardOverview = {
  account: {
    email: string;
    apiKeyStatus: ApiKeyStatus;
    createdAt: string;
    lastRenewedAt: string | null;
  };
  usage: {
    requestCount: number;
    fileCount: number | null;
    storageUsedBytes: number | null;
  };
  recentFiles: Array<{
    cid: string;
    originalFilename: string;
    uploadedAt: string;
    size: number;
  }>;
  capabilities: {
    renewApiKey: boolean;
    revokeApiKey: boolean;
    recentFilesAvailable: boolean;
  };
};

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";

import { DashboardView } from "@/components/auth/dashboard-view";

const pushMock = jest.fn();
const replaceMock = jest.fn();
const logoutMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  usePathname: () => "/dashboard",
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isHydrating: false,
    logout: logoutMock,
  }),
}));

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardView />
    </QueryClientProvider>,
  );
}

describe("DashboardView", () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
    logoutMock.mockReset();
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it("renders account and usage cards from dashboard API", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 200,
        data: {
          account: {
            email: "user@example.com",
            apiKeyStatus: "active",
            createdAt: "2026-03-12T10:00:00.000Z",
            lastRenewedAt: null,
          },
          usage: {
            requestCount: 7,
            fileCount: null,
            storageUsedBytes: null,
          },
          recentFiles: [],
          capabilities: {
            renewApiKey: true,
            revokeApiKey: true,
            recentFilesAvailable: false,
          },
        },
      }),
    }) as unknown as typeof fetch;

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText("User Dashboard")).toBeInTheDocument();
      expect(screen.getByText("user@example.com")).toBeInTheDocument();
      expect(screen.getByText("Requests made")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getByText("Recent files feed will be enabled once backend list endpoint is available.")).toBeInTheDocument();
    });
  });
});

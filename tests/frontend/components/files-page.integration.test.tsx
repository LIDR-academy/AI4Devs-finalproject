import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import FilesPage from "@/app/files/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => "/files",
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isHydrating: false,
    logout: jest.fn(),
  }),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
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
      <FilesPage />
    </QueryClientProvider>,
  );
}

describe("FilesPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    window.confirm = jest.fn(() => true);

    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders list view rows from files API", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 200,
        data: [
          {
            cid: "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca",
            original_filename: "notes.txt",
            size: 1024,
            pinned: true,
            uploaded_at: "2026-03-13T10:00:00.000Z",
            content_type: "text/plain",
          },
        ],
        meta: {
          page: 1,
          page_size: 10,
          total: 1,
          total_pages: 1,
          sort_by: "uploaded",
          sort_order: "desc",
          search: "",
          pinned: "all",
        },
      }),
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "My Files" })).toBeInTheDocument();
      expect(screen.getByText("notes.txt")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Pin selected" })).toBeInTheDocument();
    });
  });

  it("switches to grid view and opens details drawer", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 200,
        data: [
          {
            cid: "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca",
            original_filename: "clip.mp4",
            size: 5120,
            pinned: false,
            uploaded_at: "2026-03-13T10:00:00.000Z",
            content_type: "video/mp4",
          },
        ],
        meta: {
          page: 1,
          page_size: 10,
          total: 1,
          total_pages: 1,
          sort_by: "uploaded",
          sort_order: "desc",
          search: "",
          pinned: "all",
        },
      }),
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText("clip.mp4")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Grid" }));

    await waitFor(() => {
      expect(screen.getAllByText("clip.mp4").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: "Open details for clip.mp4" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("File Details")).toBeInTheDocument();
      expect(screen.getByText("video/mp4")).toBeInTheDocument();
    });
  });

  it("renders image, video, and text previews in grid mode", async () => {
    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.startsWith("/api/files?")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 200,
            data: [
              {
                cid: "bafy-preview-image",
                original_filename: "preview-image.png",
                size: 2048,
                pinned: true,
                uploaded_at: "2026-03-13T10:00:00.000Z",
                content_type: null,
              },
              {
                cid: "bafy-preview-video",
                original_filename: "preview-video.mp4",
                size: 4096,
                pinned: false,
                uploaded_at: "2026-03-13T10:01:00.000Z",
                content_type: null,
              },
              {
                cid: "bafy-preview-text",
                original_filename: "preview-text.txt",
                size: 120,
                pinned: false,
                uploaded_at: "2026-03-13T10:02:00.000Z",
                content_type: "text/plain",
              },
            ],
            meta: {
              page: 1,
              page_size: 10,
              total: 3,
              total_pages: 1,
              sort_by: "uploaded",
              sort_order: "desc",
              search: "",
              pinned: "all",
            },
          }),
        });
      }

      if (url === "/api/retrieve/bafy-preview-text") {
        return Promise.resolve({
          ok: true,
          text: async () => "This is a text preview body for the grid card.",
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({ status: 200 }),
      });
    });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText("preview-image.png")).toBeInTheDocument();
      expect(screen.getByText("preview-video.mp4")).toBeInTheDocument();
      expect(screen.getByText("preview-text.txt")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Grid" }));

    await waitFor(() => {
      expect(screen.getByAltText("Preview of preview-image.png")).toBeInTheDocument();
      expect(screen.getByLabelText("Preview of preview-video.mp4")).toBeInTheDocument();
      expect(screen.getByLabelText("Preview text for preview-text.txt")).toHaveTextContent("This is a text preview body");
      expect(screen.getByLabelText("Preview type Image for preview-image.png")).toBeInTheDocument();
      expect(screen.getByLabelText("Preview type Video for preview-video.mp4")).toBeInTheDocument();
      expect(screen.getByLabelText("Preview type Text for preview-text.txt")).toBeInTheDocument();
    });
  });

  it("triggers pin action for a row", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          data: [
            {
              cid: "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca",
              original_filename: "archive.zip",
              size: 4096,
              pinned: false,
              uploaded_at: "2026-03-13T10:00:00.000Z",
              content_type: "application/zip",
            },
          ],
          meta: {
            page: 1,
            page_size: 10,
            total: 1,
            total_pages: 1,
            sort_by: "uploaded",
            sort_order: "desc",
            search: "",
            pinned: "all",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 202, message: "Pinning request queued" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          data: [
            {
              cid: "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca",
              original_filename: "archive.zip",
              size: 4096,
              pinned: true,
              uploaded_at: "2026-03-13T10:00:00.000Z",
              content_type: "application/zip",
            },
          ],
          meta: {
            page: 1,
            page_size: 10,
            total: 1,
            total_pages: 1,
            sort_by: "uploaded",
            sort_order: "desc",
            search: "",
            pinned: "all",
          },
        }),
      });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText("archive.zip")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Pin archive.zip" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/files/bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca/pin",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("deletes a single file after confirmation", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          data: [
            {
              cid: "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca",
              original_filename: "to-delete.txt",
              size: 200,
              pinned: false,
              uploaded_at: "2026-03-13T10:00:00.000Z",
              content_type: "text/plain",
            },
          ],
          meta: {
            page: 1,
            page_size: 10,
            total: 1,
            total_pages: 1,
            sort_by: "uploaded",
            sort_order: "desc",
            search: "",
            pinned: "all",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 200, message: "File deleted successfully" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          data: [],
          meta: {
            page: 1,
            page_size: 10,
            total: 0,
            total_pages: 1,
            sort_by: "uploaded",
            sort_order: "desc",
            search: "",
            pinned: "all",
          },
        }),
      });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText("to-delete.txt")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete to-delete.txt" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/files/bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("deletes selected files in bulk after confirmation", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          data: [
            {
              cid: "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca",
              original_filename: "bulk-1.txt",
              size: 200,
              pinned: false,
              uploaded_at: "2026-03-13T10:00:00.000Z",
              content_type: "text/plain",
            },
            {
              cid: "bafybeia6z4j6plm6rvs6m4xzpkx3b3w22x6d7bh6r7odqldl4l6q2m4xpe",
              original_filename: "bulk-2.txt",
              size: 300,
              pinned: true,
              uploaded_at: "2026-03-13T10:01:00.000Z",
              content_type: "text/plain",
            },
          ],
          meta: {
            page: 1,
            page_size: 10,
            total: 2,
            total_pages: 1,
            sort_by: "uploaded",
            sort_order: "desc",
            search: "",
            pinned: "all",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 200, message: "Bulk delete completed" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          data: [],
          meta: {
            page: 1,
            page_size: 10,
            total: 0,
            total_pages: 1,
            sort_by: "uploaded",
            sort_order: "desc",
            search: "",
            pinned: "all",
          },
        }),
      });

    renderWithQueryClient();

    await waitFor(() => {
      expect(screen.getByText("bulk-1.txt")).toBeInTheDocument();
      expect(screen.getByText("bulk-2.txt")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Select all files"));
    fireEvent.click(screen.getByRole("button", { name: "Delete selected" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/files/delete/bulk",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});

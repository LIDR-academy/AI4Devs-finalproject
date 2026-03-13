import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import RetrievePage from "@/app/retrieve/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => "/retrieve",
  useSearchParams: () => ({
    get: () => null,
  }),
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

describe("RetrievePage", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
      },
      writable: true,
    });

    global.URL.createObjectURL = jest.fn(() => "blob:preview") as unknown as typeof URL.createObjectURL;
    global.URL.revokeObjectURL = jest.fn();

    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("shows validation error for invalid CID", async () => {
    render(<RetrievePage />);

    fireEvent.change(screen.getByLabelText("Enter CID"), { target: { value: "invalid" } });
    fireEvent.click(screen.getByRole("button", { name: "Retrieve" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid CID format")).toBeInTheDocument();
    });
  });

  it("retrieves file and renders metadata plus history", async () => {
    const headers = new Map<string, string>([
      ["content-type", "text/plain"],
      ["content-disposition", 'inline; filename="notes.txt"'],
      ["content-length", "11"],
      ["last-modified", "Fri, 13 Mar 2026 10:00:00 GMT"],
    ]);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: {
        get: (key: string) => headers.get(key.toLowerCase()) ?? null,
      },
      blob: async () => ({
        size: 11,
        text: async () => "hello world",
      }),
    });

    render(<RetrievePage />);

    fireEvent.change(screen.getByLabelText("Enter CID"), {
      target: { value: "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Retrieve" }));

    await waitFor(() => {
      expect(screen.getAllByText("notes.txt").length).toBeGreaterThan(0);
      expect(screen.getByText("text/plain")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();
      expect(screen.getByText("Recent retrievals")).toBeInTheDocument();
    });
  });

  it("shows API error for missing file", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "File not found" }),
    });

    render(<RetrievePage />);

    fireEvent.change(screen.getByLabelText("Enter CID"), {
      target: { value: "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Retrieve" }));

    await waitFor(() => {
      expect(screen.getByText("File not found")).toBeInTheDocument();
    });
  });

  it("renders a video preview for video MIME types", async () => {
    const headers = new Map<string, string>([
      ["content-type", "video/mp4"],
      ["content-disposition", 'inline; filename="clip.mp4"'],
      ["content-length", "12345"],
    ]);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: {
        get: (key: string) => headers.get(key.toLowerCase()) ?? null,
      },
      blob: async () => ({
        size: 12345,
        text: async () => "",
      }),
    });

    render(<RetrievePage />);

    fireEvent.change(screen.getByLabelText("Enter CID"), {
      target: { value: "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Retrieve" }));

    await waitFor(() => {
      expect(screen.getByText("Preview loop: first 15 seconds.")).toBeInTheDocument();
      expect(screen.getByText("video/mp4")).toBeInTheDocument();
    });

    expect(document.querySelector("video")).not.toBeNull();
  });
});

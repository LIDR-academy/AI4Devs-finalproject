import { act, render, screen, waitFor } from "@testing-library/react";

import UploadPage from "@/app/upload/page";
import { useUploadStore } from "@/stores/upload-store";

const pushMock = jest.fn();
const replaceMock = jest.fn();
const logoutMock = jest.fn();
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

type DropHandler = (acceptedFiles: File[], rejectedFiles: Array<{ file: File; errors: Array<{ code: string; message: string }> }>) => void;

let dropHandler: DropHandler | null = null;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  usePathname: () => "/upload",
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isHydrating: false,
    logout: logoutMock,
  }),
}));

jest.mock("react-dropzone", () => ({
  useDropzone: (options: { onDrop: DropHandler }) => {
    dropHandler = options.onDrop;
    return {
      getRootProps: () => ({ role: "button" }),
      getInputProps: (props: Record<string, unknown> = {}) => props,
      isDragActive: false,
    };
  },
}));

type XhrScenario = {
  status: number;
  body: unknown;
  progressSteps?: number[];
};

let xhrScenario: XhrScenario = {
  status: 201,
  body: { status: 201 },
  progressSteps: [40, 100],
};

class MockXMLHttpRequest {
  static instances: MockXMLHttpRequest[] = [];

  status = 0;
  responseText = "";
  upload: { onprogress: null | ((event: { lengthComputable: boolean; loaded: number; total: number }) => void) } = {
    onprogress: null,
  };
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  onabort: null | (() => void) = null;

  constructor() {
    MockXMLHttpRequest.instances.push(this);
  }

  open() {}

  abort() {
    this.onabort?.();
  }

  send() {
    for (const step of xhrScenario.progressSteps ?? []) {
      this.upload.onprogress?.({ lengthComputable: true, loaded: step, total: 100 });
    }
    this.status = xhrScenario.status;
    this.responseText = JSON.stringify(xhrScenario.body);
    this.onload?.();
  }
}

describe("UploadPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
    logoutMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    useUploadStore.getState().resetAll();
    dropHandler = null;
    xhrScenario = {
      status: 201,
      body: { status: 201 },
      progressSteps: [40, 100],
    };
    global.fetch = jest.fn();
    global.XMLHttpRequest = MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("uploads a file and shows the CID plus session history", async () => {
    xhrScenario = {
      status: 201,
      body: {
        status: 201,
        message: "File uploaded successfully",
        data: {
          mode: "direct",
          cid: "bafy-direct-cid",
          originalFilename: "hello.txt",
          size: 5,
          uploadedAt: "2026-03-13T08:00:00.000Z",
        },
      },
      progressSteps: [25, 100],
    };

    render(<UploadPage />);

    expect(dropHandler).not.toBeNull();

    await act(async () => {
      dropHandler?.([new File(["hello"], "hello.txt", { type: "text/plain" })], []);
    });

    await waitFor(() => {
      expect(screen.getAllByText("hello.txt").length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: "Show details" })).toBeInTheDocument();
      expect(screen.getAllByText("bafy-direct-cid").length).toBe(1);
    });

    await act(async () => {
      screen.getByRole("button", { name: "Show details" }).click();
    });

    await waitFor(() => {
      expect(screen.getByText("CID ready")).toBeInTheDocument();
      expect(screen.getAllByText("bafy-direct-cid").length).toBeGreaterThan(1);
      expect(screen.getByRole("button", { name: "Hide details" })).toBeInTheDocument();
    });
  });

  it("allows removing a completed upload from the queue", async () => {
    xhrScenario = {
      status: 201,
      body: {
        status: 201,
        message: "File uploaded successfully",
        data: {
          mode: "direct",
          cid: "bafy-direct-cid",
          originalFilename: "hello.txt",
          size: 5,
          uploadedAt: "2026-03-13T08:00:00.000Z",
        },
      },
      progressSteps: [25, 100],
    };

    render(<UploadPage />);

    await act(async () => {
      dropHandler?.([new File(["hello"], "hello.txt", { type: "text/plain" })], []);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Show details" })).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByRole("button", { name: "Remove" }).click();
    });

    await waitFor(() => {
      expect(screen.queryByText("CID ready")).not.toBeInTheDocument();
      expect(screen.getByText("No files in the queue yet. Select files above to start uploading.")).toBeInTheDocument();
    });
  });

  it("polls async upload status until the CID is available", async () => {
    jest.useFakeTimers();

    xhrScenario = {
      status: 202,
      body: {
        status: 202,
        message: "File upload queued",
        data: {
          mode: "async",
          taskId: "task-123",
          statusUrl: "/api/upload/status/task-123",
        },
      },
      progressSteps: [100],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: 200,
          data: {
            taskId: "task-123",
            phase: "in_progress",
            progress: 60,
            message: "Task is in progress",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: 200,
          data: {
            taskId: "task-123",
            phase: "done",
            progress: 100,
            result: {
              cid: "bafy-async-cid",
              originalFilename: "video.webm",
              size: 12,
            },
          },
        }),
      });

    render(<UploadPage />);

    await act(async () => {
      dropHandler?.([new File(["video"], "video.webm", { type: "video/webm" })], []);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/upload/status/task-123", expect.objectContaining({ method: "GET" }));
    });

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(screen.getAllByText("bafy-async-cid").length).toBeGreaterThan(0);
    });
  });
});
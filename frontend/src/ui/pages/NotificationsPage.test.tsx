// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ListNotificationsResponse, Notification } from "@/domain/types/notification";
import { ToastProvider } from "@/infrastructure/context/ToastContext";
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/infrastructure/repositories/notificationsRepository";
import { ToastContainer } from "@/ui/components/Toast";
import { NotificationsPage } from "./NotificationsPage";

vi.mock("@/infrastructure/repositories/notificationsRepository", () => ({
  listNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));

const mockListNotifications = vi.mocked(listNotifications);
const mockMarkNotificationAsRead = vi.mocked(markNotificationAsRead);
const mockMarkAllNotificationsAsRead = vi.mocked(markAllNotificationsAsRead);

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "ntf-1",
    notificationType: 1,
    content: "Class canceled",
    isRead: false,
    sentAt: "2026-08-22T16:00:00.000Z",
    classId: "cl-1",
    createdAt: "2026-08-22T16:00:00.000Z",
    ...overrides,
  };
}

function response(notifications: Notification[]): ListNotificationsResponse {
  return {
    data: notifications,
    meta: {
      hasMore: false,
      nextCursor: null,
      totalCount: notifications.length,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    },
  };
}

function setup(queryClient: QueryClient, notifications: Notification[]) {
  mockListNotifications.mockResolvedValue(response(notifications));
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <NotificationsPage />
        <ToastContainer />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("NotificationsPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockListNotifications.mockReset();
    mockMarkNotificationAsRead.mockReset();
    mockMarkAllNotificationsAsRead.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the list of notifications", async () => {
    setup(queryClient, [notification(), notification({ id: "ntf-2", content: "New spot" })]);

    expect(await screen.findByText("Class canceled")).toBeInTheDocument();
    expect(screen.getByText("New spot")).toBeInTheDocument();
  });

  it("does not redirect when clicking an unread notification and marks it as read", async () => {
    const user = userEvent.setup();
    setup(queryClient, [notification()]);
    mockMarkNotificationAsRead.mockResolvedValue(notification({ isRead: true }));

    await user.click(await screen.findByText("Class canceled"));

    expect(mockMarkNotificationAsRead).toHaveBeenCalledWith("ntf-1");
    expect(screen.getByText("Class canceled")).toBeInTheDocument();
  });

  it("does not mark already-read notifications when clicked", async () => {
    const user = userEvent.setup();
    setup(queryClient, [notification({ id: "ntf-read", isRead: true })]);

    await user.click(await screen.findByText("Class canceled"));

    expect(mockMarkNotificationAsRead).not.toHaveBeenCalled();
  });

  it("shows Mark all as read only when there are unread notifications", async () => {
    setup(queryClient, [notification({ isRead: false })]);

    expect(await screen.findByRole("button", { name: "Mark all as read" })).toBeInTheDocument();
  });

  it("hides Mark all as read when everything is read", async () => {
    setup(queryClient, [notification({ isRead: true, content: "Read one" })]);

    await screen.findByText("Read one");
    expect(screen.queryByRole("button", { name: "Mark all as read" })).not.toBeInTheDocument();
  });

  it("marks all as read and shows a success toast", async () => {
    const user = userEvent.setup();
    setup(queryClient, [notification(), notification({ id: "ntf-2", content: "Second" })]);
    mockMarkAllNotificationsAsRead.mockResolvedValue({ count: 2 });

    await user.click(await screen.findByRole("button", { name: "Mark all as read" }));

    expect(mockMarkAllNotificationsAsRead).toHaveBeenCalledWith();
    expect(await screen.findByText("All notifications marked as read.")).toBeInTheDocument();
  });

  it("shows an error toast when mark all as read fails", async () => {
    const user = userEvent.setup();
    setup(queryClient, [notification()]);
    mockMarkAllNotificationsAsRead.mockRejectedValue(new Error("Network down"));

    await user.click(await screen.findByRole("button", { name: "Mark all as read" }));

    expect(await screen.findByText("Failed to mark notifications as read")).toBeInTheDocument();
  });
});

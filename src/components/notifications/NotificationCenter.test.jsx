import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../services/api", () => ({
  getNotifications: vi.fn(),
  markNotificationsRead: vi.fn(),
}));

import NotificationCenter from "./NotificationCenter";
import { getNotifications, markNotificationsRead } from "../../services/api";

const data = {
  unread_count: 2,
  notifications: [
    { id: "n1", tier: 1, kind: "echo_reply", read: false, created_at: new Date().toISOString(),
      payload: { echo_id: "e1", book_title: "Piranesi", actors: ["quiet_reader"], count: 1 } },
    { id: "n2", tier: 2, kind: "weekly_digest", read: false, created_at: new Date().toISOString(),
      payload: { period: "2026-W28", books_this_week: 3, memory: "Three months ago, X wrecked you." } },
    { id: "n3", tier: 0, kind: "password_changed", read: true, created_at: new Date().toISOString(),
      payload: { message: "Your password was changed." } },
  ],
};

describe("NotificationCenter [F4.1 / F4.2 / F3.8]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a presence dot (not a number) when there are unread items", async () => {
    getNotifications.mockResolvedValue(data);
    const { container } = render(<NotificationCenter />);
    await waitFor(() => expect(container.querySelector(".nc-dot")).toBeInTheDocument());
    // Calm-first: the bell's accessible name mentions unread, but no number is painted on it.
    expect(screen.getByRole("button", { name: /2 unread/i })).toBeInTheDocument();
  });

  it("renders batched reply notices and the weekly digest [F3.8 / F4.2]", async () => {
    getNotifications.mockResolvedValue(data);
    render(<NotificationCenter />);
    await userEvent.click(await screen.findByRole("button", { name: /notifications/i }));

    expect(await screen.findByText(/replied to your echo/i)).toBeInTheDocument();
    expect(screen.getByText(/@quiet_reader/)).toBeInTheDocument();
    expect(screen.getByText(/your reading week/i)).toBeInTheDocument();
    expect(screen.getByText(/shelved/i)).toBeInTheDocument();
  });

  it("marks all read", async () => {
    getNotifications.mockResolvedValue(data);
    markNotificationsRead.mockResolvedValue(undefined);
    render(<NotificationCenter />);
    await userEvent.click(await screen.findByRole("button", { name: /notifications/i }));
    await userEvent.click(await screen.findByRole("button", { name: /mark all read/i }));
    expect(markNotificationsRead).toHaveBeenCalledWith(null);
  });

  it("shows an honest empty state", async () => {
    getNotifications.mockResolvedValue({ notifications: [], unread_count: 0 });
    render(<NotificationCenter />);
    await userEvent.click(await screen.findByRole("button", { name: /notifications/i }));
    expect(await screen.findByText(/all caught up/i)).toBeInTheDocument();
  });
});

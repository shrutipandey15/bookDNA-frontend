import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ username: "alice" }),
  Link: ({ children, ...p }) => <a {...p}>{children}</a>,
}));
vi.mock("../components/DNACard", () => ({ default: () => <div data-testid="dnacard" /> }));
vi.mock("../services/api", () => ({ getProfileByHandle: vi.fn() }));

import PublicProfile from "./PublicProfile";
import { getProfileByHandle } from "../services/api";

describe("PublicProfile — visibility-aware, no counts [P0-NEW-1 / F3.7]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the visibility-aware /profile/{handle} endpoint (not the old public surface)", async () => {
    getProfileByHandle.mockResolvedValue({ restricted: true, handle: "alice", display_name: "Alice", personality_type: "The Grief Romantic" });
    render(<PublicProfile />);
    await waitFor(() => expect(getProfileByHandle).toHaveBeenCalledWith("alice"));
  });

  it("shows 'no such profile' when the server returns 404 (blocked/unknown/private)", async () => {
    getProfileByHandle.mockResolvedValue(null);
    render(<PublicProfile />);
    await waitFor(() => expect(screen.getByText(/no such profile/i)).toBeInTheDocument());
  });

  it("renders a minimal card for a restricted profile — no shelf data", async () => {
    getProfileByHandle.mockResolvedValue({ restricted: true, handle: "alice", display_name: "Alice", personality_type: "The Grief Romantic" });
    render(<PublicProfile />);
    await waitFor(() => expect(screen.getByText(/this profile is private/i)).toBeInTheDocument());
  });

  it("renders a full profile WITHOUT any volume/echo counts", async () => {
    getProfileByHandle.mockResolvedValue({
      restricted: false, handle: "alice", display_name: "Alice", personality_type: "The Grief Romantic",
      signature: null, book_count: 42,
      now_reading: [{ entry_id: "n1", title: "Reading Now", author: "A", dominant_emotion: "grief" }],
      collections: [], milestones: [], recent: [],
    });
    const { container } = render(<PublicProfile />);
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText("Reading Now")).toBeInTheDocument();
    // No "42 volumes"/"N echoes" tallies — comparison-vanity metrics are forbidden.
    expect(container.textContent).not.toMatch(/\b42\b/);
    expect(container.textContent).not.toMatch(/\d+\s*(volumes?|echoes|books?)\b/i);
  });
});

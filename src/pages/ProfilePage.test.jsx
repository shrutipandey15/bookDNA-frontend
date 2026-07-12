import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("../contexts/JournalContext", () => ({ useJournal: () => ({ entries: [] }) }));
vi.mock("../components/DNACard", () => ({ default: () => <div data-testid="dnacard" /> }));
vi.mock("../services/api", () => ({
  getMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
  createCollection: vi.fn(), deleteCollection: vi.fn(),
  addCollectionItem: vi.fn(), removeCollectionItem: vi.fn(), reorderCollection: vi.fn(),
}));

import ProfilePage from "./ProfilePage";
import { getMyProfile, updateMyProfile } from "../services/api";

const profile = {
  handle: "alice", display_name: "Alice", bio: null, profile_visibility: "private",
  personality_type: "The Grief Romantic", is_self: true, signature: null,
  now_reading: [{ entry_id: "n1", title: "Reading Now", author: "A", dominant_emotion: "grief", status: "reading" }],
  collections: [],
  milestones: [{ kind: "first_book", label: "Logged your first book" }],
  book_count: 5,
  recent: [{ entry_id: "r1", title: "Recent Book", author: "B", dominant_emotion: "awe", status: "finished" }],
};

describe("ProfilePage self-view [F2.8]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the identity strip, Now, history and milestones — no counts", async () => {
    getMyProfile.mockResolvedValue(profile);
    const { container } = render(<ProfilePage />);
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText("@alice")).toBeInTheDocument();
    expect(screen.getByText("The Grief Romantic")).toBeInTheDocument();
    expect(screen.getByText("Reading Now")).toBeInTheDocument();
    expect(screen.getByText("Recent Book")).toBeInTheDocument();
    expect(screen.getByText(/Logged your first book/)).toBeInTheDocument();
    // No "5 books" tally rendered anywhere as a status metric.
    expect(container.textContent).not.toMatch(/\b5\s+(books?|volumes?)\b/i);
  });

  it("edits the bio via inline editor", async () => {
    getMyProfile.mockResolvedValue(profile);
    updateMyProfile.mockResolvedValue({ ...profile, bio: "reads for catharsis" });
    render(<ProfilePage />);
    await waitFor(() => screen.getByText("Alice"));

    await userEvent.click(screen.getByRole("button", { name: /\+ add/i }));
    await userEvent.type(screen.getByLabelText(/your bio/i), "reads for catharsis");
    await userEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(updateMyProfile).toHaveBeenCalledWith({ bio: "reads for catharsis" });
    await waitFor(() => expect(screen.getByText("reads for catharsis")).toBeInTheDocument());
  });

  it("renders the signature card only when a DNA profile exists", async () => {
    getMyProfile.mockResolvedValue({ ...profile, signature: { personality: { name: "X" } } });
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByTestId("dnacard")).toBeInTheDocument());
  });
});

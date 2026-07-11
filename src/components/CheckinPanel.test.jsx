import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../services/api", () => ({
  getCheckins: vi.fn(),
  createCheckin: vi.fn(),
}));

import CheckinPanel from "./CheckinPanel";
import { getCheckins, createCheckin } from "../services/api";

const entry = { id: "e1", title: "Piranesi" };

describe("CheckinPanel [F2.3 / B2.3]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows an empty state then the created check-in", async () => {
    getCheckins.mockResolvedValue([]);
    createCheckin.mockImplementation(async (id, data) => ({
      id: "c1",
      entry_id: id,
      emotion_slug: data.emotion_slug,
      note: data.note,
      created_at: new Date().toISOString(),
    }));

    render(<CheckinPanel entry={entry} onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/first/i)).toBeInTheDocument());

    // "log this moment" is disabled until an emotion is chosen.
    const logBtn = screen.getByRole("button", { name: /log this moment/i });
    expect(logBtn).toBeDisabled();

    await userEvent.click(screen.getAllByRole("radio")[0]);
    await userEvent.type(screen.getByPlaceholderText(/few words/i), "slow but hypnotic");
    await userEvent.click(logBtn);

    await waitFor(() => expect(createCheckin).toHaveBeenCalledTimes(1));
    const [id, payload] = createCheckin.mock.calls[0];
    expect(id).toBe("e1");
    expect(payload.emotion_slug).toBeTruthy();
    expect(payload.note).toBe("slow but hypnotic");
    // The new check-in appears in the timeline.
    await waitFor(() => expect(screen.getByText(/slow but hypnotic/)).toBeInTheDocument());
  });

  it("renders existing check-ins newest-first", async () => {
    getCheckins.mockResolvedValue([
      { id: "c1", entry_id: "e1", emotion_slug: "grief", note: "gutted", created_at: new Date().toISOString() },
    ]);
    render(<CheckinPanel entry={entry} onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/gutted/)).toBeInTheDocument());
  });
});

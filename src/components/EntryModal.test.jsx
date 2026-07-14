import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Book search is network — stub it so the modal renders offline.
vi.mock("../services/api", () => ({ searchBooks: vi.fn().mockResolvedValue([]) }));

import EntryModal from "./EntryModal";

describe("EntryModal full entry fields [F2.1 / B2.4]", () => {
  it("saves status, dates, and private notes in the payload", async () => {
    const onSave = vi.fn();
    const entry = {
      id: "abc",
      title: "Piranesi",
      author: "Susanna Clarke",
      status: "finished",
      started_at: "2026-01-01",
      finished_at: "2026-01-10",
      emotions: [],
    };
    render(<EntryModal entry={entry} onSave={onSave} onDelete={vi.fn()} onClose={vi.fn()} />);

    await userEvent.type(
      screen.getByPlaceholderText(/Just for you/i),
      "read it in one sitting",
    );
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const [payload, id] = onSave.mock.calls[0];
    expect(id).toBe("abc");
    expect(payload).toMatchObject({
      status: "finished",
      started_at: "2026-01-01",
      finished_at: "2026-01-10",
      notes: "read it in one sitting",
    });
  });

  it("does NOT expose a public-echo box that publishes to a global feed [P0-NEW-1]", () => {
    render(<EntryModal entry={{ id: "z", title: "X", emotions: [] }} onSave={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />);
    // The old "one-line verdict … for the world" textarea is gone.
    expect(screen.queryByText(/public echo/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/one-line verdict/i)).not.toBeInTheDocument();
  });

  it("save payload omits public_echo entirely", async () => {
    const onSave = vi.fn();
    render(<EntryModal entry={{ id: "z", title: "X", status: "finished", emotions: [] }} onSave={onSave} onDelete={vi.fn()} onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));
    expect(onSave).toHaveBeenCalled();
    expect(onSave.mock.calls[0][0]).not.toHaveProperty("public_echo");
  });

  it("hides the date fields for a want-to-read book", async () => {
    const { container } = render(
      <EntryModal
        entry={{ id: "x", title: "Unread", status: "want_to_read", emotions: [] }}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("radio", { name: /want to read/i })).toHaveAttribute("aria-checked", "true");
    // No date inputs while the book is unstarted.
    expect(container.querySelectorAll('input[type="date"]')).toHaveLength(0);
  });

  it("shows only the started date for a currently-reading book", async () => {
    const { container } = render(
      <EntryModal
        entry={{ id: "y", title: "Midway", status: "reading", emotions: [] }}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    // 'started' shows, 'finished' date does not (only one date input).
    await waitFor(() =>
      expect(container.querySelectorAll('input[type="date"]')).toHaveLength(1),
    );
    expect(screen.getByText("started")).toBeInTheDocument();
  });
});

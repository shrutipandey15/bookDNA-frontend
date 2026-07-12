import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EchoCard from "./EchoCard";

const echo = {
  id: "e1",
  handle: "quiet_reader",
  book_title: "Piranesi",
  book_author: "Susanna Clarke",
  primary_emotion: "awe",
  body: "I read this on a train and missed my stop.",
  created_at: "2026-07-01T10:00:00Z",
};

describe("EchoCard design-rule guards [F3.3 / F3.7]", () => {
  it("renders the echo with NO counts of any kind", () => {
    const { container } = render(<EchoCard echo={echo} />);
    expect(screen.getByText(/missed my stop/)).toBeInTheDocument();
    // No digits anywhere that could be a like/reply/reaction tally.
    // (The date is rendered as "Jul 1" — month name + day, we assert no "N replies"/"N likes" strings.)
    expect(container.textContent).not.toMatch(/\d+\s*(likes?|replies|reactions?|echoes)/i);
  });

  it("shows the handle as plain text, NOT a link (no people-browsing) [F3.7]", () => {
    render(<EchoCard echo={echo} />);
    const handle = screen.getByText("@quiet_reader");
    expect(handle.closest("a")).toBeNull();
    expect(handle.tagName).not.toBe("A");
  });

  it("exposes safety actions (reply / mute / block / report) in the menu", async () => {
    const onMute = vi.fn(), onBlock = vi.fn(), onReport = vi.fn(), onReply = vi.fn();
    render(<EchoCard echo={echo} onMute={onMute} onBlock={onBlock} onReport={onReport} onReply={onReply} />);
    await userEvent.click(screen.getByRole("button", { name: /echo actions/i }));

    expect(screen.getByRole("menuitem", { name: /^reply$/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /mute @quiet_reader/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /block @quiet_reader/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("menuitem", { name: /report/i }));
    expect(onReport).toHaveBeenCalledWith(echo);
  });
});

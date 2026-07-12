import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../services/api", () => ({
  getEchoThread: vi.fn(),
  postReply: vi.fn(),
  reactToEcho: vi.fn(),
}));

import EchoThread from "./EchoThread";
import { getEchoThread, postReply } from "../../services/api";

const thread = {
  echo: { id: "e1", handle: "author_one", body: "the echo body", primary_emotion: "grief", created_at: "2026-07-01T10:00:00Z" },
  replies: [
    { id: "r1", handle: "reader_two", body: "me too", created_at: "2026-07-01T11:00:00Z" },
  ],
};

describe("EchoThread [F3.4 / B3.4]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows replies BEFORE the reaction affordances (conversation first)", async () => {
    getEchoThread.mockResolvedValue(thread);
    render(<EchoThread echoId="e1" />);
    await waitFor(() => expect(screen.getByText("me too")).toBeInTheDocument());

    // In DOM order, the replies section must come before the reactions group.
    const repliesLabel = screen.getByText("replies");
    const reactions = screen.getByRole("group", { name: /private reactions/i });
    // eslint-disable-next-line no-bitwise
    const order = repliesLabel.compareDocumentPosition(reactions);
    expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("posts a reply and appends it to the thread", async () => {
    getEchoThread.mockResolvedValue(thread);
    postReply.mockResolvedValue({ id: "r2", handle: "me", body: "adding this", created_at: "2026-07-01T12:00:00Z" });
    render(<EchoThread echoId="e1" />);
    await waitFor(() => screen.getByText("me too"));

    await userEvent.type(screen.getByLabelText(/your reply/i), "adding this");
    await userEvent.click(screen.getByRole("button", { name: /^reply$/i }));

    await waitFor(() => expect(postReply).toHaveBeenCalledWith("e1", "adding this"));
    expect(await screen.findByText("adding this")).toBeInTheDocument();
  });

  it("reaction toggles show NO counts to the viewer [B3.5]", async () => {
    getEchoThread.mockResolvedValue(thread);
    render(<EchoThread echoId="e1" />);
    await waitFor(() => screen.getByText("me too"));
    const reactions = screen.getByRole("group", { name: /private reactions/i });
    // Labels only, never a number.
    expect(reactions.textContent).not.toMatch(/\d/);
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WelcomeModal from "./WelcomeModal";

describe("WelcomeModal first-run [F2.10]", () => {
  it("offers a single primary action to begin", async () => {
    const onBegin = vi.fn();
    render(<WelcomeModal onBegin={onBegin} onDismiss={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /begin with one book/i }));
    expect(onBegin).toHaveBeenCalledOnce();
  });

  it("lets the user dismiss and look around", async () => {
    const onDismiss = vi.fn();
    render(<WelcomeModal onBegin={vi.fn()} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole("button", { name: /look around/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("frames the ritual, not a feature tour (no feature list)", () => {
    render(<WelcomeModal onBegin={vi.fn()} onDismiss={vi.fn()} />);
    // It talks about ONE book, honestly — not a tour of tabs/features.
    expect(screen.getByText(/one book at a time/i)).toBeInTheDocument();
  });
});

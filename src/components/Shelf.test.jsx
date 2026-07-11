import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpineBook } from "./Shelf";

const entry = { id: "b1", title: "Piranesi", author: "Susanna Clarke", intensity: 7, emotions: [] };

describe("SpineBook keyboard parity [F2.9 / P5-9]", () => {
  it("is focusable and labelled (not a hover-only affordance)", () => {
    render(<SpineBook entry={entry} onClick={vi.fn()} />);
    const spine = screen.getByRole("button", { name: /Piranesi · Susanna Clarke/ });
    expect(spine).toHaveAttribute("tabindex", "0");
  });

  it("activates on Enter and Space, not just click", async () => {
    const onClick = vi.fn();
    render(<SpineBook entry={entry} onClick={onClick} />);
    const spine = screen.getByRole("button", { name: /Piranesi/ });

    spine.focus();
    expect(spine).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

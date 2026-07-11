import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

function Harness({ onClose }) {
  return (
    <Modal onClose={onClose} title="Log a book">
      <input aria-label="title-field" />
      <button>save</button>
    </Modal>
  );
}

describe("Modal accessible baseline [F1.7 / P5-9]", () => {
  it("exposes a labelled modal dialog", () => {
    render(<Harness onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Log a book");
  });

  it("moves focus into the dialog on open", () => {
    render(<Harness onClose={() => {}} />);
    expect(screen.getByLabelText("title-field")).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("traps Tab within the dialog (wraps from last to first)", async () => {
    render(<Harness onClose={() => {}} />);
    const input = screen.getByLabelText("title-field");
    const save = screen.getByRole("button", { name: "save" });

    input.focus();
    await userEvent.tab();
    expect(save).toHaveFocus();
    // Tab past the last focusable wraps back to the first.
    await userEvent.tab();
    expect(input).toHaveFocus();
  });

  it("restores focus to the trigger on close", async () => {
    function Container() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          {open && (
            <Modal onClose={() => setOpen(false)} title="Log a book">
              <button>inside</button>
            </Modal>
          )}
        </>
      );
    }
    render(<Container />);
    const trigger = screen.getByRole("button", { name: "open" });
    trigger.focus();
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
});

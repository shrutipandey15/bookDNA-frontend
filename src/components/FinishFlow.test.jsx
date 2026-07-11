import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FinishFlow from "./FinishFlow";

const entry = { id: "e1", title: "Piranesi", intensity: 6 };

function pickFirstEmotion() {
  // The emotion radios are the only role=radio elements on an arc step.
  const radios = screen.getAllByRole("radio");
  return userEvent.click(radios[0]);
}

describe("FinishFlow three-beat arc [F2.2 / B2.2]", () => {
  it("walks start→middle→end→verdict and submits the arc payload", async () => {
    const onFinish = vi.fn().mockResolvedValue({});
    const onClose = vi.fn();
    render(<FinishFlow entry={entry} onFinish={onFinish} onClose={onClose} />);

    // Beat 1: start. "continue" is disabled until an emotion is chosen.
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
    await pickFirstEmotion();
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Beat 2: middle.
    await waitFor(() => expect(screen.getByText(/thick of it/i)).toBeInTheDocument());
    await pickFirstEmotion();
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Beat 3: end.
    await waitFor(() => expect(screen.getByText(/leave you/i)).toBeInTheDocument());
    await pickFirstEmotion();
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Verdict step: thought + finish.
    await screen.findByPlaceholderText(/true thing/i);
    await userEvent.type(screen.getByPlaceholderText(/true thing/i), "ruined me");
    await userEvent.click(screen.getByRole("button", { name: /finish the book/i }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    const [id, payload] = onFinish.mock.calls[0];
    expect(id).toBe("e1");
    expect(payload).toMatchObject({
      thought: "ruined me",
      intensity: 6,
    });
    expect(payload.start_emotion_slug).toBeTruthy();
    expect(payload.middle_emotion_slug).toBeTruthy();
    expect(payload.end_emotion_slug).toBeTruthy();
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an inline error and stays open if finishing fails", async () => {
    const onFinish = vi.fn().mockRejectedValue(new Error("server exploded"));
    const onClose = vi.fn();
    render(<FinishFlow entry={entry} onFinish={onFinish} onClose={onClose} />);

    for (let i = 0; i < 3; i++) {
      await pickFirstEmotion();
      await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    }
    await userEvent.click(screen.getByRole("button", { name: /finish the book/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/server exploded/i));
    expect(onClose).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../services/api", () => ({
  getInsight: vi.fn(),
  getWeeklyMemory: vi.fn(),
}));

import MirrorCard from "./MirrorCard";
import { getInsight, getWeeklyMemory } from "../services/api";

describe("MirrorCard [F2.5 / B2.6]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders nothing when there is not enough yet (honest empty)", async () => {
    getInsight.mockResolvedValue({ sentence: null, week_key: "2026-W28" });
    getWeeklyMemory.mockResolvedValue({ memory: null, week_key: "2026-W28" });
    const { container } = render(<MirrorCard />);
    await waitFor(() => expect(getInsight).toHaveBeenCalled());
    // No fabricated content — the aside never appears.
    expect(container.querySelector(".mirror")).toBeNull();
  });

  it("surfaces the insight sentence and the resurfaced memory when present", async () => {
    getInsight.mockResolvedValue({ sentence: "You reach for grief when the weather turns.", week_key: "x" });
    getWeeklyMemory.mockResolvedValue({ memory: "Three months ago, Piranesi wrecked you.", week_key: "x" });
    render(<MirrorCard />);
    await waitFor(() => expect(screen.getByText(/weather turns/i)).toBeInTheDocument());
    expect(screen.getByText(/Three months ago/i)).toBeInTheDocument();
  });

  it("shows just the insight if only that is available", async () => {
    getInsight.mockResolvedValue({ sentence: "A quiet week of comfort reads.", week_key: "x" });
    getWeeklyMemory.mockResolvedValue({ memory: null, week_key: "x" });
    render(<MirrorCard />);
    await waitFor(() => expect(screen.getByText(/comfort reads/i)).toBeInTheDocument());
  });
});

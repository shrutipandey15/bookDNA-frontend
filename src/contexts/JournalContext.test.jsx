import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { JournalProvider, useJournal } from "./JournalContext";
import { ApiError } from "../services/api";

// Mock the API surface JournalContext touches. Only getAllEntries/getDNAProfile
// run on mount; the rest are stubbed so imports resolve.
vi.mock("../services/api", async () => {
  const actual = await vi.importActual("../services/api");
  return {
    ...actual,
    getAllEntries: vi.fn(),
    getDNAProfile: vi.fn().mockResolvedValue(null),
    getHeatmap: vi.fn(),
    getStats: vi.fn(),
    generateDNA: vi.fn(),
    createEntry: vi.fn(),
    updateEntry: vi.fn(),
    deleteEntry: vi.fn(),
    generateShareToken: vi.fn(),
  };
});

import { getAllEntries } from "../services/api";

function Probe() {
  const { loading, entries, entriesError } = useJournal();
  if (loading) return <div>loading</div>;
  if (entriesError) return <div>error:{entriesError.kind}</div>;
  if (entries.length === 0) return <div>empty</div>;
  return <div>have:{entries.length}</div>;
}

function renderProvider() {
  return render(
    <JournalProvider>
      <Probe />
    </JournalProvider>,
  );
}

describe("JournalContext error-vs-empty [F1.2 / P5-2]", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("shows an empty shelf when the fetch succeeds with no entries", async () => {
    getAllEntries.mockResolvedValue({ entries: [], total: 0 });
    renderProvider();
    await waitFor(() => expect(screen.getByText("empty")).toBeInTheDocument());
  });

  it("shows a distinct error (not empty) when the server 500s", async () => {
    getAllEntries.mockRejectedValue(new ApiError(500, "server"));
    renderProvider();
    await waitFor(() => expect(screen.getByText("error:server")).toBeInTheDocument());
    expect(screen.queryByText("empty")).not.toBeInTheDocument();
  });

  it("surfaces a rate-limit distinctly from a server error", async () => {
    getAllEntries.mockRejectedValue(new ApiError(429, "rate_limited"));
    renderProvider();
    await waitFor(() => expect(screen.getByText("error:rate_limited")).toBeInTheDocument());
  });

  it("renders entries when the fetch returns data", async () => {
    getAllEntries.mockResolvedValue({ entries: [{ id: 1, emotions: [] }], total: 1 });
    renderProvider();
    await waitFor(() => expect(screen.getByText("have:1")).toBeInTheDocument());
  });
});

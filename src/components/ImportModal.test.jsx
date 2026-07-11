import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../services/api", () => ({ importLibrary: vi.fn() }));

import ImportModal from "./ImportModal";
import { importLibrary } from "../services/api";

function csv(name = "goodreads.csv") {
  return new File(["Title,Author\nPiranesi,Susanna Clarke\n"], name, { type: "text/csv" });
}

describe("ImportModal [F2.6 / B2.7]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a non-CSV file dropped in (accept= can't guard the drop path)", async () => {
    render(<ImportModal onClose={vi.fn()} onImported={vi.fn()} />);
    const dropzone = screen.getByText(/choose a CSV/i).closest("button");
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(/\.csv/i);
    expect(screen.getByRole("button", { name: /import library/i })).toBeDisabled();
  });

  it("uploads the CSV and shows an honest result, refreshing on import", async () => {
    importLibrary.mockResolvedValue({ parsed: 10, imported: 8, skipped: 2, errors: [] });
    const onImported = vi.fn();
    render(<ImportModal onClose={vi.fn()} onImported={onImported} />);

    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, csv());
    await userEvent.click(screen.getByRole("button", { name: /import library/i }));

    await waitFor(() => expect(importLibrary).toHaveBeenCalledTimes(1));
    expect(onImported).toHaveBeenCalled();
    // Result counts are surfaced.
    expect(await screen.findByText("8")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("surfaces per-row errors and does not refresh when nothing imported", async () => {
    importLibrary.mockResolvedValue({ parsed: 3, imported: 0, skipped: 0, errors: ["row 2: missing title"] });
    const onImported = vi.fn();
    render(<ImportModal onClose={vi.fn()} onImported={onImported} />);

    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, csv());
    await userEvent.click(screen.getByRole("button", { name: /import library/i }));

    await waitFor(() => expect(screen.getByText(/couldn't be read/i)).toBeInTheDocument());
    expect(onImported).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../services/api", () => ({
  createCollection: vi.fn(), deleteCollection: vi.fn(),
  addCollectionItem: vi.fn(), removeCollectionItem: vi.fn(), reorderCollection: vi.fn(),
}));

import CollectionsEditor from "./CollectionsEditor";
import { createCollection, addCollectionItem, reorderCollection } from "../../services/api";

const shelf = [
  { id: "e1", title: "Piranesi", author: "Susanna Clarke" },
  { id: "e2", title: "The Employees", author: "Olga Ravn" },
];

describe("CollectionsEditor [F2.8]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a new collection", async () => {
    createCollection.mockResolvedValue({ id: "c1" });
    const onChanged = vi.fn().mockResolvedValue();
    render(<CollectionsEditor collections={[]} shelf={shelf} onChanged={onChanged} />);

    await userEvent.click(screen.getByRole("button", { name: /new collection/i }));
    await userEvent.type(screen.getByLabelText(/collection name/i), "books that ruined me");
    await userEvent.click(screen.getByRole("button", { name: /^create$/i }));

    expect(createCollection).toHaveBeenCalledWith({ title: "books that ruined me", visibility: "private" });
    expect(onChanged).toHaveBeenCalled();
  });

  it("adds a book from the shelf to a collection", async () => {
    addCollectionItem.mockResolvedValue();
    const onChanged = vi.fn().mockResolvedValue();
    const collections = [{ id: "c1", title: "Comfort reads", visibility: "private", position: 0, books: [] }];
    render(<CollectionsEditor collections={collections} shelf={shelf} onChanged={onChanged} />);

    await userEvent.click(screen.getByRole("button", { name: /add a book/i }));
    await userEvent.selectOptions(screen.getByLabelText(/choose a book from your shelf/i), "e1");
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(addCollectionItem).toHaveBeenCalledWith("c1", "e1");
  });

  it("reorders books with keyboard-operable up/down (not drag-only) [a11y]", async () => {
    reorderCollection.mockResolvedValue();
    const onChanged = vi.fn().mockResolvedValue();
    const collections = [{
      id: "c1", title: "Ordered", visibility: "private", position: 0,
      books: [
        { entry_id: "e1", title: "First", dominant_emotion: "grief" },
        { entry_id: "e2", title: "Second", dominant_emotion: "awe" },
      ],
    }];
    render(<CollectionsEditor collections={collections} shelf={shelf} onChanged={onChanged} />);

    await userEvent.click(screen.getByRole("button", { name: /move Second up/i }));
    expect(reorderCollection).toHaveBeenCalledWith("c1", ["e2", "e1"]);
  });
});

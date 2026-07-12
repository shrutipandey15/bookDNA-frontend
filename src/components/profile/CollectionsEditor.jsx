import { useState } from "react";
import { EMOTIONS } from "../../services/emotions";
import {
  createCollection, deleteCollection, addCollectionItem, removeCollectionItem, reorderCollection,
} from "../../services/api";
import "./CollectionsEditor.css";

/**
 * Curated collections — self-expression, not metrics. [F2.8 / §Feature 2]
 *
 * Reorder is keyboard-operable (up/down buttons), NOT drag-only — the blueprint's
 * a11y requirement. Books are added from your own shelf.
 */
const VIS = [
  { value: "private", label: "private" },
  { value: "community", label: "community" },
  { value: "public", label: "public" },
];

function move(arr, from, to) {
  const next = arr.slice();
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}

function CollectionCard({ collection, shelf, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pick, setPick] = useState("");

  const inIds = new Set((collection.books || []).map((b) => b.entry_id));
  const addable = shelf.filter((e) => !inIds.has(e.id) && !inIds.has(String(e.id)));

  const run = async (fn) => { setBusy(true); try { await fn(); await onChanged(); } finally { setBusy(false); } };

  const addBook = () => { if (pick) run(() => addCollectionItem(collection.id, pick)).then(() => { setPick(""); setAdding(false); }); };
  const reorder = (from, to) => {
    if (to < 0 || to >= collection.books.length) return;
    const ids = move(collection.books.map((b) => b.entry_id), from, to);
    run(() => reorderCollection(collection.id, ids));
  };

  return (
    <div className="col-card">
      <div className="col-head">
        <div>
          <div className="col-title">{collection.title}</div>
          {collection.description && <div className="col-desc">{collection.description}</div>}
        </div>
        <div className="col-head-right">
          <span className={`col-vis col-vis--${collection.visibility}`}>{collection.visibility}</span>
          <button className="col-del" disabled={busy} onClick={() => run(() => deleteCollection(collection.id))} aria-label={`Delete ${collection.title}`}>×</button>
        </div>
      </div>

      {collection.books?.length > 0 ? (
        <ul className="col-books">
          {collection.books.map((b, i) => {
            const emo = b.dominant_emotion ? EMOTIONS[b.dominant_emotion] : null;
            return (
              <li key={b.entry_id} className="col-book">
                <span className="col-book-dot" style={{ background: emo?.color || "var(--ink-quiet)" }} />
                <span className="col-book-title">{b.title}</span>
                {b.author && <span className="col-book-author">{b.author}</span>}
                <span className="col-book-actions">
                  <button disabled={busy || i === 0} onClick={() => reorder(i, i - 1)} aria-label={`Move ${b.title} up`}>↑</button>
                  <button disabled={busy || i === collection.books.length - 1} onClick={() => reorder(i, i + 1)} aria-label={`Move ${b.title} down`}>↓</button>
                  <button disabled={busy} onClick={() => run(() => removeCollectionItem(collection.id, b.entry_id))} aria-label={`Remove ${b.title}`}>remove</button>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="col-empty">No books yet.</div>
      )}

      {adding ? (
        <div className="col-add">
          <select className="col-add-select" value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Choose a book from your shelf">
            <option value="">choose a book from your shelf…</option>
            {addable.map((e) => <option key={e.id} value={e.id}>{e.title}{e.author ? ` — ${e.author}` : ""}</option>)}
          </select>
          <button className="btn brass" disabled={busy || !pick} onClick={addBook}>add</button>
          <button className="btn ghost" disabled={busy} onClick={() => { setAdding(false); setPick(""); }}>cancel</button>
        </div>
      ) : (
        <button className="col-add-btn" disabled={busy || addable.length === 0} onClick={() => setAdding(true)}>
          {addable.length === 0 ? "every book is already here" : "+ add a book"}
        </button>
      )}
    </div>
  );
}

export default function CollectionsEditor({ collections, shelf, onChanged }) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await createCollection({ title: title.trim(), visibility });
      setTitle(""); setVisibility("private"); setCreating(false);
      await onChanged();
    } finally { setBusy(false); }
  };

  return (
    <div className="cols">
      {collections.length === 0 && !creating && (
        <p className="cols-empty">
          Collections are where your personality lives — "books that rearranged me," "comfort re-reads."
          Curate a shelf of your own.
        </p>
      )}

      {collections.map((c) => (
        <CollectionCard key={c.id} collection={c} shelf={shelf} onChanged={onChanged} />
      ))}

      {creating ? (
        <div className="cols-new">
          <input
            className="cols-new-title"
            placeholder="Collection name — e.g. “books that ruined me”"
            value={title}
            maxLength={120}
            aria-label="Collection name"
            onChange={(e) => setTitle(e.target.value)}
          />
          <select className="cols-new-vis" value={visibility} onChange={(e) => setVisibility(e.target.value)} aria-label="Collection visibility">
            {VIS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <button className="btn brass" disabled={busy || !title.trim()} onClick={create}>create</button>
          <button className="btn ghost" disabled={busy} onClick={() => setCreating(false)}>cancel</button>
        </div>
      ) : (
        <button className="cols-new-btn" onClick={() => setCreating(true)}>+ new collection</button>
      )}
    </div>
  );
}

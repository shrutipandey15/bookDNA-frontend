import { useState, useEffect, useRef } from "react";
import { Loader2, BookOpen, Pencil } from "lucide-react";
import { EMO_LIST, EMOTIONS } from "../services/emotions";
import { searchBooks } from "../services/api";
import "./EntryModal.css";

const INTENSITY_LABELS = [
  "", "barely", "barely", "lingered", "lingered",
  "felt it", "felt it", "obsessed", "obsessed", "wrecked", "wrecked",
];

export default function EntryModal({ entry, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(entry?.title || "");
  const [author, setAuthor] = useState(entry?.author || "");
  const [coverUrl, setCoverUrl] = useState(entry?.cover_url || "");
  const [isbn, setIsbn] = useState(entry?.isbn || "");
  const [intensity, setIntensity] = useState(entry?.intensity || 5);
  const [emotions, setEmotions] = useState(entry?.emotions?.map((e) => e.emotion_id) || []);
  const [quote, setQuote] = useState(entry?.quote || "");
  const [publicEcho, setPublicEcho] = useState(entry?.public_echo || "");

  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeout = useRef(null);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  const justSelected = useRef(false);
  const isEditing = useRef(!!entry?.id);

  useEffect(() => {
    if (isEditing.current) return;
    if (justSelected.current) { justSelected.current = false; return; }
    if (title.length < 3) { setSearchResults([]); setShowResults(false); return; }
    setSearching(true);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchBooks(title.trim());
        setSearchResults(results.slice(0, 5));
        setShowResults(results.length > 0);
        setSelectedIndex(-1);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 600);
    return () => clearTimeout(searchTimeout.current);
  }, [title]);

  useEffect(() => {
    const handleClick = (e) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectBook = (book) => {
    justSelected.current = true;
    setTitle(book.title);
    setAuthor(book.author || "");
    setCoverUrl(book.cover_url || "");
    setIsbn(book.isbn || "");
    setShowResults(false);
    setSearchResults([]);
  };
  const useCustomTitle = () => {
    justSelected.current = true;
    setShowResults(false);
    setSearchResults([]);
  };
  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, searchResults.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && selectedIndex >= 0) { e.preventDefault(); selectBook(searchResults[selectedIndex]); }
    else if (e.key === "Escape") { setShowResults(false); }
  };
  const toggleEmo = (id) => setEmotions((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      author: author.trim() || null,
      cover_url: coverUrl || null,
      isbn: isbn || null,
      intensity,
      emotions: emotions.map((id) => ({ emotion_id: id, strength: intensity })),
      quote: quote.trim() || null,
      public_echo: publicEcho.trim() || null,
    }, entry?.id || null);
  };
  const handleDelete = () => { if (entry?.id) onDelete(entry.id); };

  const isEdit = !!entry?.id;
  const primaryEmo = emotions[0] ? EMOTIONS[emotions[0]] : null;
  const coverColor = primaryEmo?.color || "var(--oxblood)";
  const entryNo = entry?.id ? String(entry.id).slice(-3).padStart(3, "0") : "NEW";
  const firstWords = title ? title.split(" ").slice(0, 3).join(" ") : "";

  return (
    <div className="em-card" role="dialog" aria-modal="true">
      <div className="em-left" style={{ background: `linear-gradient(155deg, ${coverColor}, color-mix(in srgb, ${coverColor} 50%, #000))` }}>
        <div className="em-left-frame" />
        <div className="em-left-content">
          <div>
            <div className="em-left-eyebrow">ENTRY № {entryNo} · {isEdit ? "IN YOUR SHELF" : "NEW · UNSHELVED"}</div>
            <div className="em-left-author">{author || "—"}</div>
          </div>
          <div>
            <div className="em-left-title">{title || "Untitled volume"}</div>
            <div className="em-left-int-wrap">
              <div className="em-left-int-label">INTENSITY</div>
              <div className="em-left-int-row">
                <span className="em-left-int-num">{intensity}</span>
                <span className="em-left-int-of">/ 10</span>
              </div>
              <div className="em-left-int-word">{INTENSITY_LABELS[intensity] || ""}.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="em-right">
        <button className="em-close" onClick={onClose} aria-label="Close">×</button>

        <div className="label" style={{ marginBottom: 8 }}>{isEdit ? `edit · entry no. ${entryNo}` : "new entry"}</div>
        <h2 className="em-h">
          {firstWords ? <>What did <em>{firstWords}</em> do to you?</> : "Begin a new entry."}
        </h2>

        <div className="em-field">
          <div className="label-sm em-field-label">title · author</div>
          <div className="em-search-wrap">
            <input
              ref={inputRef}
              className="em-input em-input-title"
              placeholder={isEdit ? "Book title" : "Search for a book…"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            {searching && <Loader2 size={14} className="em-search-spinner" />}
            {showResults && (
              <div className="em-search-results" ref={resultsRef}>
                {searchResults.map((book, i) => (
                  <div
                    key={`${book.title}-${book.isbn || i}`}
                    className={`em-search-item ${i === selectedIndex ? "selected" : ""}`}
                    onClick={() => selectBook(book)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    {book.cover_url ? (
                      <img className="em-search-cover" src={book.cover_url} alt="" onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <div className="em-search-cover-placeholder"><BookOpen size={18} /></div>
                    )}
                    <div>
                      <div className="em-search-book-title">{book.title}</div>
                      <div className="em-search-book-author">
                        {book.author || "Unknown author"}{book.published_year && ` · ${book.published_year}`}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="em-search-item em-search-custom" onClick={useCustomTitle}>
                  <div className="em-search-cover-placeholder"><Pencil size={18} /></div>
                  <div>
                    <div className="em-search-book-title">Use “{title}” as-is</div>
                    <div className="em-search-book-author">Add title &amp; author manually</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {!coverUrl && (
            <input
              className="em-input em-input-author"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          )}
        </div>

        <div className="em-field">
          <div className="label-sm em-field-label">what did it make you feel?</div>
          <div className="em-emo-chips">
            {EMO_LIST.map(([id, e]) => {
              const active = emotions.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={`chip ${active ? "active" : ""}`}
                  style={{ "--chip-c": e.color }}
                  onClick={() => toggleEmo(id)}
                >
                  <span className="swatch" />
                  {e.label.toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="em-field">
          <div className="em-int-head">
            <div className="label-sm">emotional intensity</div>
            <div className="em-int-word">{INTENSITY_LABELS[intensity] || ""}.</div>
          </div>
          <div className="em-int-slider">
            <div className="em-int-track" />
            <div className="em-int-fill" style={{ width: `${intensity * 10}%` }} />
            <input
              className="em-int-range"
              type="range"
              min="1" max="10"
              value={intensity}
              onChange={(e) => setIntensity(+e.target.value)}
            />
            {[1, 3, 5, 7, 10].map((n) => (
              <span key={n} className="em-int-tick" style={{ left: `calc(${n * 10}% - 6px)` }}>{n}</span>
            ))}
          </div>
        </div>

        <div className="em-field">
          <div className="label-sm em-field-label">the line that hit hardest</div>
          <textarea
            className="em-input em-textarea em-quote"
            placeholder="Optional — the quote you can't forget…"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={2}
          />
        </div>

        <div className="em-field">
          <div className="em-echo-head">
            <span style={{ color: "var(--brass)" }}>✦</span>
            <div className="label-sm">public echo</div>
            <span className="em-echo-hint">spoiler-free. for the world.</span>
          </div>
          <textarea
            className="em-input em-textarea em-echo"
            placeholder="Your one-line verdict…"
            value={publicEcho}
            onChange={(e) => setPublicEcho(e.target.value)}
            rows={2}
          />
        </div>

        <div className="em-footer">
          {isEdit ? (
            <button className="em-remove" onClick={handleDelete}>– remove from shelf</button>
          ) : <span />}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn ghost" onClick={onClose}>cancel</button>
            <button className="btn brass" onClick={handleSave} disabled={!title.trim()}>
              {isEdit ? "save changes" : "shelve it"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

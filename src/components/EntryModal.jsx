import { useState, useEffect, useRef } from "react";
import { EMO_LIST } from "../services/emotions";
import { createEntry, updateEntry, deleteEntry, searchBooks } from "../services/api";
import "./EntryModal.css";

export default function EntryModal({ entry, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(entry?.title || "");
  const [author, setAuthor] = useState(entry?.author || "");
  const [coverUrl, setCoverUrl] = useState(entry?.cover_url || "");
  const [isbn, setIsbn] = useState(entry?.isbn || "");
  const [intensity, setIntensity] = useState(entry?.intensity || 5);
  const [emotions, setEmotions] = useState(
    entry?.emotions?.map((e) => e.emotion_id) || []
  );
  const [quote, setQuote] = useState(entry?.quote || "");
  const [publicEcho, setPublicEcho] = useState(entry?.public_echo || "");
  const [saving, setSaving] = useState(false);

  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeout = useRef(null);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (entry?.id) return; // Don't search when editing existing entry
    if (title.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchBooks(title);
        setSearchResults(results);
        setShowResults(results.length > 0);
        setSelectedIndex(-1);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [title, entry?.id]);

  // Close results on click outside
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
    setTitle(book.title);
    setAuthor(book.author || "");
    setCoverUrl(book.cover_url || "");
    setIsbn(book.isbn || "");
    setShowResults(false);
    setSearchResults([]);
  };

  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      selectBook(searchResults[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const toggleEmo = (id) => {
    setEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const data = {
      title: title.trim(),
      author: author.trim() || null,
      cover_url: coverUrl || null,
      isbn: isbn || null,
      intensity,
      emotions: emotions.map((id) => ({ emotion_id: id, strength: intensity })),
      quote: quote.trim() || null,
      public_echo: publicEcho.trim() || null,
    };
    try {
      let saved;
      if (entry?.id) {
        saved = await updateEntry(entry.id, data);
      } else {
        saved = await createEntry(data);
      }
      onSave(saved);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!entry?.id) return;
    await deleteEntry(entry.id);
    onDelete(entry.id);
  };

  const intLabels = [
    "", "barely", "barely", "lingered", "lingered",
    "felt it", "felt it", "obsessed", "obsessed", "wrecked", "wrecked",
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-text">
            {entry?.id ? "Edit Entry" : "Add Book"}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Book search with autocomplete */}
        <div className="m-search-wrap">
          <input
            ref={inputRef}
            className="m-input m-input-title"
            placeholder={entry?.id ? "Book title" : "Search for a book..."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {searching && <span className="m-search-spinner">⟳</span>}

          {showResults && (
            <div className="m-search-results" ref={resultsRef}>
              {searchResults.map((book, i) => (
                <div
                  key={`${book.title}-${book.isbn || i}`}
                  className={`m-search-item ${i === selectedIndex ? "selected" : ""}`}
                  onClick={() => selectBook(book)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  {book.cover_url ? (
                    <img
                      className="m-search-cover"
                      src={book.cover_url}
                      alt=""
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="m-search-cover-placeholder">📖</div>
                  )}
                  <div className="m-search-info">
                    <div className="m-search-book-title">{book.title}</div>
                    <div className="m-search-book-author">
                      {book.author || "Unknown author"}
                      {book.published_year && ` · ${book.published_year}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected book preview */}
        {coverUrl && (
          <div className="m-selected-preview">
            <img
              src={coverUrl}
              alt=""
              className="m-preview-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="m-preview-info">
              <div className="m-preview-title">{title}</div>
              <div className="m-preview-author">{author}</div>
            </div>
            <button
              className="m-preview-clear"
              onClick={() => { setCoverUrl(""); setIsbn(""); }}
              title="Clear selection"
            >×</button>
          </div>
        )}

        <input
          className="m-input"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={coverUrl ? { display: "none" } : {}}
        />

        <div className="m-label">What did it make you feel?</div>
        <div className="m-emo-grid">
          {EMO_LIST.map(([id, e]) => (
            <div
              key={id}
              className={`m-emo-tag ${emotions.includes(id) ? "active" : ""}`}
              style={{ "--tc": e.color }}
              onClick={() => toggleEmo(id)}
            >
              <span>{e.icon}</span>
              <span>{e.label}</span>
            </div>
          ))}
        </div>

        <div className="m-label">Emotional intensity</div>
        <div className="m-slider-row">
          <span className="m-slider-val">{intensity}</span>
          <input
            type="range" min="1" max="10"
            value={intensity}
            onChange={(e) => setIntensity(+e.target.value)}
            className="m-slider"
          />
          <span className="m-slider-label">{intLabels[intensity]}</span>
        </div>

        <div className="m-label">The line that hit hardest</div>
        <textarea
          className="m-input m-textarea"
          placeholder="Optional — the quote you can't forget..."
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows={2}
        />

        <div className="m-echo-section">
          <div className="m-echo-label">✦ Public Echo</div>
          <textarea
            className="m-input m-echo-input"
            placeholder="Spoiler-free vibe for the world..."
            value={publicEcho}
            onChange={(e) => setPublicEcho(e.target.value)}
            rows={2}
          />
          <div className="m-echo-hint">
            Vibes only. No spoilers. This is what people see.
          </div>
        </div>

        <div className="modal-actions">
          {entry?.id && (
            <button className="m-btn m-btn-danger" onClick={handleDelete}>
              Delete
            </button>
          )}
          <button
            className="m-btn m-btn-primary"
            onClick={handleSave}
            disabled={saving || !title.trim()}
          >
            {saving ? "Saving..." : entry?.id ? "Update" : "Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
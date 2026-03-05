import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Pencil, Check, Camera, Lock, Plus, Search, X, BookOpen } from "lucide-react";
import { useJournal } from "../../contexts/JournalContext";
import { EMOTIONS, getPrimaryEmotion } from "../../services/emotions";
import { searchBooks } from "../../services/api";
import { useRoomData } from "./hooks/useRoomData";
import { buildDefaultLayout } from "./utils/roomDefaults";
import UnlockToast from "./ui/UnlockToast";
import "./ReadingRoom.css";

function DecoSucculent() {
  return (
    <svg viewBox="0 0 32 40" className="shelf-deco__svg" aria-label="Succulent">
      <path d="M9 28 L11 38 L21 38 L23 28 Z" fill="#5a3e2a" stroke="#4a3220" strokeWidth="0.5" />
      <path d="M8 26 L24 26 L24 28 L8 28 Z" fill="#6b4a32" rx="1" />
      <ellipse cx="16" cy="24" rx="4" ry="7" fill="#4a6b45" opacity="0.9" />
      <ellipse cx="12" cy="22" rx="3.5" ry="6" fill="#3d5e3a" transform="rotate(-20,12,22)" />
      <ellipse cx="20" cy="22" rx="3.5" ry="6" fill="#3d5e3a" transform="rotate(20,20,22)" />
      <ellipse cx="16" cy="20" rx="3" ry="5.5" fill="#567a52" />
      <ellipse cx="14" cy="19" rx="2" ry="4" fill="#4a6b45" transform="rotate(-10,14,19)" />
      <ellipse cx="18" cy="19" rx="2" ry="4" fill="#4a6b45" transform="rotate(10,18,19)" />
    </svg>
  );
}

function DecoMug() {
  return (
    <svg viewBox="0 0 36 40" className="shelf-deco__svg shelf-deco__svg--mug" aria-label="Coffee Mug">
      <rect x="6" y="18" width="18" height="20" rx="2" fill="#2a2a30" stroke="#3a3a42" strokeWidth="0.5" />
      <path d="M24 22 Q30 22 30 28 Q30 34 24 34" fill="none" stroke="#3a3a42" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="15" cy="20" rx="8" ry="2" fill="#1e1410" />
      <path className="deco-steam deco-steam--1" d="M12 16 Q11 12 13 8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeLinecap="round" />
      <path className="deco-steam deco-steam--2" d="M16 15 Q17 11 15 7" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeLinecap="round" />
      <path className="deco-steam deco-steam--3" d="M19 16 Q18 12 20 9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function DecoBookend() {
  return (
    <svg viewBox="0 0 20 40" className="shelf-deco__svg" aria-label="Bookend">
      <path d="M4 8 L4 38 L18 38 L18 34 L8 34 L8 8 Z" fill="#1a1a1e" stroke="#2a2a30" strokeWidth="0.5" />
      <path d="M4 8 L8 8 L8 34 L4 34 Z" fill="rgba(255,255,255,0.03)" />
    </svg>
  );
}

function DecoPothos() {
  return (
    <svg viewBox="0 0 40 48" className="shelf-deco__svg shelf-deco__svg--pothos" aria-label="Trailing Pothos">
      <rect x="12" y="14" width="16" height="12" rx="2" fill="#5a3e2a" />
      <rect x="11" y="12" width="18" height="3" rx="1" fill="#6b4a32" />
      <path className="deco-leaf deco-leaf--1" d="M14 26 Q10 32 8 38" stroke="#3d5e3a" strokeWidth="1.5" fill="none" />
      <ellipse cx="8" cy="38" rx="4" ry="2.5" fill="#4a6b45" transform="rotate(-20,8,38)" />
      <path className="deco-leaf deco-leaf--2" d="M18 26 Q22 34 18 44" stroke="#3d5e3a" strokeWidth="1.5" fill="none" />
      <ellipse cx="18" cy="44" rx="3.5" ry="2.5" fill="#3d5e3a" transform="rotate(10,18,44)" />
      <path className="deco-leaf deco-leaf--3" d="M26 26 Q30 30 32 36" stroke="#4a6b45" strokeWidth="1" fill="none" />
      <ellipse cx="32" cy="36" rx="3" ry="2" fill="#567a52" transform="rotate(25,32,36)" />
      <ellipse cx="16" cy="14" rx="4" ry="3" fill="#4a6b45" transform="rotate(-15,16,14)" />
      <ellipse cx="24" cy="14" rx="3.5" ry="2.5" fill="#3d5e3a" transform="rotate(15,24,14)" />
    </svg>
  );
}

function DecoCandle() {
  return (
    <svg viewBox="0 0 24 44" className="shelf-deco__svg shelf-deco__svg--candle" aria-label="Candle">
      <rect x="7" y="16" width="10" height="26" rx="1" fill="#d4c8b0" opacity="0.8" />
      <rect x="7" y="16" width="10" height="26" rx="1" fill="url(#candleGrad)" />
      <line x1="12" y1="16" x2="12" y2="12" stroke="#2a2a2a" strokeWidth="0.8" />
      <ellipse className="deco-flame" cx="12" cy="9" rx="3" ry="5" fill="#ff9944" opacity="0.7" />
      <ellipse className="deco-flame-inner" cx="12" cy="10" rx="1.5" ry="3" fill="#ffcc66" opacity="0.8" />
      <circle className="deco-flame-glow" cx="12" cy="9" r="10" fill="rgba(255,153,68,0.04)" />
      <path d="M9 16 Q9 14 10 16" fill="#d4c8b0" opacity="0.5" />
      <defs>
        <linearGradient id="candleGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DecoCat() {
  return (
    <svg viewBox="0 0 44 28" className="shelf-deco__svg shelf-deco__svg--cat" aria-label="Sleeping Cat">
      <ellipse className="deco-cat-body" cx="22" cy="20" rx="16" ry="8" fill="#1e1e22" />
      <circle cx="36" cy="16" r="5" fill="#1e1e22" />
      <path d="M33 12 L34 8 L36 11 Z" fill="#1e1e22" />
      <path d="M37 11 L39 7 L40 12 Z" fill="#1e1e22" />
      <path d="M33.5 12 L34.3 9 L35.5 11.5 Z" fill="#2a2a30" />
      <path d="M37.5 11.5 L38.8 8 L39.5 12 Z" fill="#2a2a30" />
      <path d="M34 16 Q35 15 36 16" fill="none" stroke="#333" strokeWidth="0.5" />
      <path d="M37 15.5 Q38 14.5 39 15.5" fill="none" stroke="#333" strokeWidth="0.5" />
      <path d="M6 18 Q2 14 6 12 Q10 10 12 14" fill="none" stroke="#1e1e22" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DecoFigurine({ color = "#C4553A" }) {
  return (
    <svg viewBox="0 0 24 40" className="shelf-deco__svg" aria-label="Personality Figurine">
      <ellipse cx="12" cy="37" rx="8" ry="2" fill="#1a1a1e" />
      <polygon points="12,6 20,20 16,20 16,34 8,34 8,20 4,20" fill={color} opacity="0.7" />
      <polygon points="12,6 20,20 16,20 16,34 8,34 8,20 4,20" fill="none" stroke={color} strokeWidth="0.5" opacity="0.9" />
      <polygon points="12,10 17,20 14,20 14,32 10,32 10,20 7,20" fill="rgba(255,255,255,0.05)" />
    </svg>
  );
}

function DecoPrism() {
  return (
    <svg viewBox="0 0 28 36" className="shelf-deco__svg shelf-deco__svg--prism" aria-label="Crystal Prism">
      <polygon points="14,4 24,20 14,34 4,20" fill="rgba(100,140,200,0.15)" stroke="rgba(140,180,240,0.2)" strokeWidth="0.5" />
      <polygon points="14,4 24,20 14,20" fill="rgba(140,180,240,0.08)" />
      <polygon points="14,4 4,20 14,20" fill="rgba(80,120,180,0.1)" />
      <polygon points="14,20 24,20 14,34" fill="rgba(60,100,160,0.08)" />
      <line x1="14" y1="6" x2="22" y2="18" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    </svg>
  );
}

function DecoFrame() {
  return (
    <svg viewBox="0 0 28 36" className="shelf-deco__svg" aria-label="Mini DNA Frame">
      <rect x="3" y="6" width="22" height="28" rx="1" fill="#1a1a1e" stroke="#2a2a30" strokeWidth="0.8" />
      <rect x="5" y="8" width="18" height="24" rx="0.5" fill="none" stroke="#222228" strokeWidth="0.5" />
      <rect x="7" y="10" width="14" height="20" rx="1" fill="#0c0c10" />
      <rect x="9" y="12" width="4" height="1.5" rx="0.5" fill="#C4553A" opacity="0.6" />
      <rect x="9" y="15" width="8" height="0.8" rx="0.3" fill="rgba(255,255,255,0.1)" />
      <rect x="9" y="17" width="6" height="0.8" rx="0.3" fill="rgba(255,255,255,0.06)" />
      <circle cx="14" cy="24" r="3" fill="none" stroke="#C4553A" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

function DecoHeart() {
  return (
    <svg viewBox="0 0 28 32" className="shelf-deco__svg" aria-label="Cracked Heart">
      <path d="M14 28 Q4 20 4 13 Q4 6 10 6 Q14 6 14 10 Q14 6 18 6 Q24 6 24 13 Q24 20 14 28Z"
        fill="#6b3040" stroke="#8a4050" strokeWidth="0.5" />
      <path d="M14 10 L13 15 L15 18 L12 22 L14 26" fill="none" stroke="#B8964E" strokeWidth="0.8" opacity="0.6" />
      <path d="M13 15 L11 16" fill="none" stroke="#B8964E" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

function DecoClock() {
  return (
    <svg viewBox="0 0 28 32" className="shelf-deco__svg" aria-label="2AM Clock">
      <circle cx="14" cy="18" r="10" fill="#1a1a1e" stroke="#2a2a30" strokeWidth="0.8" />
      <circle cx="14" cy="18" r="8.5" fill="none" stroke="#222228" strokeWidth="0.3" />
      <line x1="14" y1="18" x2="17" y2="12" stroke="rgba(180,220,200,0.3)" strokeWidth="1" strokeLinecap="round" />
      <line x1="14" y1="18" x2="14" y2="10.5" stroke="rgba(180,220,200,0.25)" strokeWidth="0.6" strokeLinecap="round" />
      <circle cx="14" cy="18" r="1" fill="rgba(180,220,200,0.2)" />
      <line x1="14" y1="9.5" x2="14" y2="10.8" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
    </svg>
  );
}

const DECO_COMPONENTS = {
  plant_basic:    { Component: DecoSucculent, label: "Succulent", width: 32 },
  mug:            { Component: DecoMug, label: "Coffee Mug", width: 36 },
  bookend:        { Component: DecoBookend, label: "Bookend", width: 20 },
  pothos:         { Component: DecoPothos, label: "Trailing Pothos", width: 40 },
  candle:         { Component: DecoCandle, label: "Candle", width: 24 },
  sleeping_cat:   { Component: DecoCat, label: "Sleeping Cat", width: 44 },
  glyph_figurine: { Component: DecoFigurine, label: "Figurine", width: 24 },
  crystal_prism:  { Component: DecoPrism, label: "Crystal Prism", width: 28 },
  mini_dna_frame: { Component: DecoFrame, label: "DNA Frame", width: 28 },
  broken_heart:   { Component: DecoHeart, label: "Cracked Heart", width: 28 },
  mini_clock:     { Component: DecoClock, label: "2AM Clock", width: 28 },
};

function useDragDrop(shelves, onReorder) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const ghostRef = useRef(null);

  const startDrag = useCallback((e, shelfIdx, itemIdx, item) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragging({ shelfIdx, itemIdx, item, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, startX: e.clientX, startY: e.clientY });

    const moveHandler = (ev) => {
      const cx = ev.clientX || ev.touches?.[0]?.clientX;
      const cy = ev.clientY || ev.touches?.[0]?.clientY;
      if (ghostRef.current) {
        ghostRef.current.style.left = `${cx - 16}px`;
        ghostRef.current.style.top = `${cy - 16}px`;
      }
      const shelfEls = document.querySelectorAll(".shelf-plank-books");
      let found = null;
      shelfEls.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (cy > r.top - 20 && cy < r.bottom + 20 && cx > r.left && cx < r.right) {
          found = i;
        }
      });
      setDragOver(found !== null ? { shelfIdx: found } : null);
    };

    const upHandler = (ev) => {
      document.removeEventListener("pointermove", moveHandler);
      document.removeEventListener("pointerup", upHandler);
      setDragging(null);
      setDragOver(null);

      if (dragOver?.shelfIdx !== undefined || found !== null) {
        const cx = ev.clientX || 0;
        const cy = ev.clientY || 0;
        const shelfEls = document.querySelectorAll(".shelf-plank-books");
        let targetShelf = null;
        shelfEls.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          if (cy > r.top - 20 && cy < r.bottom + 20 && cx > r.left && cx < r.right) {
            targetShelf = i;
          }
        });

        if (targetShelf !== null) {
          const shelfEl = shelfEls[targetShelf];
          const children = Array.from(shelfEl.children).filter(c => !c.classList.contains("shelf-drop-indicator"));
          let insertIdx = children.length;
          for (let i = 0; i < children.length; i++) {
            const cr = children[i].getBoundingClientRect();
            if (cx < cr.left + cr.width / 2) { insertIdx = i; break; }
          }
          onReorder(shelfIdx, itemIdx, targetShelf, insertIdx);
        }
      }
    };

    let found = null;
    document.addEventListener("pointermove", moveHandler);
    document.addEventListener("pointerup", upHandler);
  }, [onReorder, dragOver]);

  return { dragging, dragOver, startDrag, ghostRef };
}

function ShelfBook({ entry, index, editMode, isDragging, onClick, onPointerDown }) {
  const emo = getPrimaryEmotion(entry);
  const secondaryEmo = entry.emotions?.[1] ? EMOTIONS[entry.emotions[1].emotion_id] : null;
  const intensity = entry.intensity || 5;
  const spineWidth = 20 + intensity * 1.8;
  const seed = (entry.title || "").length + (entry.author || "").length;
  const bookHeight = 148 + ((seed % 7) - 3);
  const lean = ((seed % 5) - 2) * 0.3;
  const isNew = entry.created_at && (Date.now() - new Date(entry.created_at).getTime()) < 86400000;
  const spineColor = entry._spineColor || emo.color;
  const topEdge = secondaryEmo?.color || spineColor;

  return (
    <div
      className={`shelf-book ${isNew ? "shelf-book--new" : ""} ${editMode ? "shelf-book--edit" : ""} ${isDragging ? "shelf-book--dragging" : ""}`}
      style={{
        "--spine-w": `${spineWidth}px`,
        "--book-h": `${bookHeight}px`,
        "--spine-color": spineColor,
        "--spine-color-dim": `${spineColor}88`,
        "--top-edge": topEdge,
        "--lean": `${lean}deg`,
        "--delay": `${index * 0.06}s`,
        touchAction: editMode ? "none" : undefined,
      }}
      onClick={editMode ? undefined : onClick}
      onPointerDown={editMode ? (e) => { e.stopPropagation(); onPointerDown(e); } : undefined}
      title={`${entry.title} — ${entry.author || "Unknown"}`}
    >
      <div className="shelf-book__spine">
        <div className="shelf-book__spine-texture" />
        <span className="shelf-book__spine-title">{entry.title}</span>
        <span className="shelf-book__spine-author">{entry.author}</span>
        <div className="shelf-book__spine-dots">
          {Array.from({ length: Math.min(5, Math.ceil(intensity / 2)) }).map((_, i) => (
            <div key={i} className="shelf-book__dot" />
          ))}
        </div>
      </div>
      <div className="shelf-book__top" />
      <div className="shelf-book__cover">
        <div className="shelf-book__cover-fallback" style={{ background: `linear-gradient(160deg, ${spineColor}55, #08080c)` }}>
          <span className="shelf-book__cover-title">{entry.title}</span>
          <span className="shelf-book__cover-author">{entry.author}</span>
        </div>
      </div>
      <div className="shelf-book__pages" />
      {editMode && <div className="shelf-book__grip">⠿</div>}
    </div>
  );
}

function ShelfDecoration({ id, editMode, isDragging, onRemove, onPointerDown }) {
  const deco = DECO_COMPONENTS[id];
  if (!deco) return null;
  const { Component } = deco;

  return (
    <div
      className={`shelf-deco ${isDragging ? "shelf-deco--dragging" : ""}`}
      title={deco.label}
      style={{ touchAction: editMode ? "none" : undefined }}
      onPointerDown={editMode ? (e) => { e.stopPropagation(); onPointerDown(e); } : undefined}
    >
      <Component />
      {editMode && (
        <button className="shelf-deco__remove" onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove">×</button>
      )}
    </div>
  );
}

function ShelfPlank({ items, shelfIndex, entryMap, editMode, isDragOver, onBookClick, onItemPointerDown, onRemoveItem, draggingItem }) {
  return (
    <div className="shelf-plank-unit">
      <div className={`shelf-plank-books ${isDragOver ? "shelf-plank-books--dragover" : ""}`}>
        {items.map((item, i) => {
          const isDragging = draggingItem?.shelfIdx === shelfIndex && draggingItem?.itemIdx === i;
          if (item.type === "book") {
            const entry = entryMap[item.id];
            if (!entry) return null;
            return (
              <ShelfBook
                key={`${item.id}-${i}`}
                entry={entry}
                index={i}
                editMode={editMode}
                isDragging={isDragging}
                onClick={() => onBookClick(item, entry)}
                onPointerDown={(e) => onItemPointerDown(e, shelfIndex, i, item)}
              />
            );
          }
          if (item.type === "display") {
            const DISPLAY_PALETTE = [
              "#6b3333", "#3d5e3a", "#334a6b", "#8a7340",
              "#5e3a5e", "#4a5560", "#7a4a30", "#5a6040",
              "#3a5a5a", "#5c3028", "#44506a", "#6a5a3a",
            ];
            const hash = (item.title || "").split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
            const spineColor = DISPLAY_PALETTE[Math.abs(hash) % DISPLAY_PALETTE.length];

            const fakeEntry = {
              id: item.id,
              title: item.title || "Unknown",
              author: item.author,
              cover_url: item.cover_url,
              intensity: 5,
              emotions: [],
              created_at: null,
              _spineColor: spineColor,
            };
            return (
              <ShelfBook
                key={`${item.id}-${i}`}
                entry={fakeEntry}
                index={i}
                editMode={editMode}
                isDragging={isDragging}
                isDisplay={true}
                onClick={() => onBookClick(item, null)}
                onPointerDown={(e) => onItemPointerDown(e, shelfIndex, i, item)}
              />
            );
          }
          if (item.type === "deco") {
            return (
              <ShelfDecoration
                key={`${item.id}-${i}`}
                id={item.id}
                editMode={editMode}
                isDragging={isDragging}
                onRemove={() => onRemoveItem(shelfIndex, i)}
                onPointerDown={(e) => onItemPointerDown(e, shelfIndex, i, item)}
              />
            );
          }
          return null;
        })}
        {items.length === 0 && !editMode && (
          <div className="shelf-empty-hint"><span className="shelf-empty-text">empty shelf</span></div>
        )}
      </div>
      <div className="shelf-plank"><div className="shelf-plank-grain" /></div>
      <div className="shelf-plank-shadow" />
    </div>
  );
}

function ItemTray({ decorations, placedDecoIds, onTrayDragStart }) {
  const placed = new Set(placedDecoIds);

  return (
    <div className="item-tray">
      <div className="item-tray__label">Your Items</div>
      <div className="item-tray__grid">
        {decorations.map(deco => {
          const render = DECO_COMPONENTS[deco.id];
          if (!render) return null;
          const { Component } = render;
          const isPlaced = placed.has(deco.id);
          const isLocked = !deco.unlocked;

          return (
            <div
              key={deco.id}
              className={`item-tray__item ${isLocked ? "item-tray__item--locked" : ""} ${isPlaced ? "item-tray__item--placed" : ""}`}
              onPointerDown={(!isLocked && !isPlaced) ? (e) => onTrayDragStart(e, deco.id) : undefined}
              title={isLocked ? deco.unlock_condition : isPlaced ? "Already on shelf" : `Drag to place: ${deco.name}`}
            >
              <span className="item-tray__preview">
                {isLocked ? <Lock size={14} /> : <Component />}
              </span>
              <span className="item-tray__name">{deco.name}</span>
              {isLocked && <span className="item-tray__condition">{deco.unlock_condition}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShelfBookSearch({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = useCallback((q) => {
    if (q.length < 2) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchBooks(q);
        setResults(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      }
      setSearching(false);
    }, 300);
  }, []);

  return (
    <div className="shelf-search-overlay" onClick={onClose}>
      <div className="shelf-search" onClick={e => e.stopPropagation()}>
        <div className="shelf-search__header">
          <Search size={16} />
          <input
            ref={inputRef}
            className="shelf-search__input"
            placeholder="Search any book to add to your shelf..."
            value={query}
            onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }}
          />
          <button className="shelf-search__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="shelf-search__results">
          {searching && <div className="shelf-search__loading">Searching...</div>}
          {!searching && results.length === 0 && query.length >= 2 && (
            <div className="shelf-search__empty">No books found</div>
          )}
          {results.map((book, i) => (
            <button key={`${book.isbn || book.title}-${i}`} className="shelf-search__result" onClick={() => onSelect(book)}>
              {book.cover_url && <img src={book.cover_url} alt="" className="shelf-search__cover" />}
              <div className="shelf-search__info">
                <div className="shelf-search__title">{book.title}</div>
                <div className="shelf-search__author">{book.author}</div>
              </div>
              <Plus size={16} className="shelf-search__add-icon" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookInfoPanel({ book, onClose, onLogBook }) {
  return (
    <div className="book-info-overlay" onClick={onClose}>
      <div className="book-info" onClick={e => e.stopPropagation()}>
        <button className="book-info__close" onClick={onClose}><X size={16} /></button>
        <div className="book-info__header">
          {book.cover_url && <img src={book.cover_url} alt="" className="book-info__cover" />}
          <div>
            <div className="book-info__title">{book.title}</div>
            <div className="book-info__author">{book.author}</div>
          </div>
        </div>
        <div className="book-info__desc">On your shelf — not yet logged with emotions.</div>
        <button className="book-info__log-btn" onClick={onLogBook}>
          <BookOpen size={14} /> Log This Book
        </button>
      </div>
    </div>
  );
}

export default function ReadingRoom({ onBookClick }) {
  const { entries } = useJournal();
  const room = useRoomData();
  const [editMode, setEditMode] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [dragOverShelf, setDragOverShelf] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [bookInfo, setBookInfo] = useState(null);
  const ghostRef = useRef(null);

  useEffect(() => { room.load(); }, [room.load]);

  useEffect(() => {
    if (!room.loading && room.layout === null && entries.length > 0) {
      const defaultLayout = buildDefaultLayout(entries);
      room.save(defaultLayout.shelves);
    }
  }, [room.loading, room.layout, entries]);

  useEffect(() => {
    if (!room.loading && room.layout && entries.length > 0) {
      const shelves = room.layout.shelves || [];
      const roomBookIds = new Set();
      for (const shelf of shelves) {
        for (const item of shelf) {
          if (item.type === "book") roomBookIds.add(item.id);
        }
      }
      const missingBooks = entries.filter(e => !roomBookIds.has(e.id));
      if (missingBooks.length > 0) {
        const newShelves = shelves.map(s => [...s]);
        for (const entry of missingBooks) {
          const targetIdx = newShelves.findIndex(s => s.length < 10);
          const idx = targetIdx >= 0 ? targetIdx : 0;
          const lastBookIdx = newShelves[idx].reduce((acc, item, i) => item.type === "book" ? i : acc, -1);
          newShelves[idx].splice(lastBookIdx + 1, 0, { type: "book", id: entry.id });
        }
        room.save(newShelves);
      }
    }
  }, [room.loading, room.layout, entries]);

  useEffect(() => {
    const handler = (e) => room.handleNewUnlocks(e.detail);
    window.addEventListener("room-unlock", handler);
    return () => window.removeEventListener("room-unlock", handler);
  }, [room.handleNewUnlocks]);

  const entryMap = useMemo(() => {
    const map = {};
    for (const e of entries) map[e.id] = e;
    return map;
  }, [entries]);

  const shelves = room.layout?.shelves || [[], [], []];
  const shelvesRef = useRef(shelves);
  shelvesRef.current = shelves;

  const placedDecoIds = useMemo(() => {
    const ids = [];
    for (const shelf of shelves) for (const item of shelf) if (item.type === "deco") ids.push(item.id);
    return ids;
  }, [shelves]);

  const shelfBookCount = useMemo(() => {
    let count = 0;
    for (const shelf of shelves) for (const item of shelf) if (item.type === "book" || item.type === "display") count++;
    return count;
  }, [shelves]);

  const handlePointerDown = useCallback((e, shelfIdx, itemIdx, item, fromTray = false) => {
    e.preventDefault();
    setDragging({ shelfIdx, itemIdx, item, fromTray });

    const ghost = ghostRef.current;
    if (ghost) {
      ghost.style.display = "block";
      ghost.style.left = `${e.clientX - 16}px`;
      ghost.style.top = `${e.clientY - 16}px`;
    }

    const dragInfo = { shelfIdx, itemIdx, item, fromTray };

    const findTargetShelf = (cx, cy) => {
      const shelfEls = document.querySelectorAll(".shelf-plank-books");
      let target = null;
      shelfEls.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (cy > r.top - 30 && cy < r.bottom + 10 && cx > r.left && cx < r.right) target = i;
      });
      return target;
    };

    const onMove = (ev) => {
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX ?? 0;
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY ?? 0;
      if (ghost) {
        ghost.style.left = `${cx - 16}px`;
        ghost.style.top = `${cy - 16}px`;
      }
      setDragOverShelf(findTargetShelf(cx, cy));
    };

    const onUp = (ev) => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      if (ghost) ghost.style.display = "none";
      setDragging(null);
      setDragOverShelf(null);

      const cx = ev.clientX ?? 0;
      const cy = ev.clientY ?? 0;
      const targetShelf = findTargetShelf(cx, cy);
      if (targetShelf === null) return;

      const shelfEls = document.querySelectorAll(".shelf-plank-books");
      const shelfEl = shelfEls[targetShelf];
      const children = Array.from(shelfEl.children).filter(c =>
        c.classList.contains("shelf-book") || c.classList.contains("shelf-deco")
      );
      let insertIdx = children.length;
      for (let i = 0; i < children.length; i++) {
        const cr = children[i].getBoundingClientRect();
        if (cx < cr.left + cr.width / 2) { insertIdx = i; break; }
      }

      const currentShelves = shelvesRef.current;
      const newShelves = currentShelves.map(s => [...s]);

      const { shelfIdx: srcShelf, itemIdx: srcIdx, item: dragItem, fromTray: isFromTray } = dragInfo;

      if (!isFromTray) {
        newShelves[srcShelf].splice(srcIdx, 1);
        if (targetShelf === srcShelf && srcIdx < insertIdx) insertIdx--;
      }

      newShelves[targetShelf].splice(insertIdx, 0, dragItem);
      room.save(newShelves);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [room]);

  const handleRemoveItem = useCallback((shelfIdx, itemIdx) => {
    const newShelves = shelvesRef.current.map(s => [...s]);
    newShelves[shelfIdx].splice(itemIdx, 1);
    room.save(newShelves);
  }, [room]);

  const handleTrayDragStart = useCallback((e, decoId) => {
    handlePointerDown(e, -1, -1, { type: "deco", id: decoId }, true);
  }, [handlePointerDown]);

  const handleAddDisplayBook = useCallback((book) => {
    const newShelves = shelvesRef.current.map(s => [...s]);
    const displayItem = {
      type: "display",
      id: `display-${book.isbn || Date.now()}`,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      isbn: book.isbn,
    };
    const targetIdx = newShelves.findIndex(s => s.length < 10);
    const idx = targetIdx >= 0 ? targetIdx : 0;
    newShelves[idx].push(displayItem);
    room.save(newShelves);
    setShowSearch(false);
  }, [room]);

  const handleBookClick = useCallback((item, entry) => {
    if (item.type === "display") {
      setBookInfo(item);
    } else if (entry) {
      onBookClick(entry);
    }
  }, [onBookClick]);

  const handleCapture = useCallback(() => {
    alert("Use your device's screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows) to capture your room.");
  }, []);

  if (room.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-glyph">◈</div>
        <div className="loading-text">Building your room...</div>
      </div>
    );
  }

  return (
    <div className="reading-room">
      <div className="reading-room__glow" />

      <div className="reading-room__controls">
        <button
          className={`room-btn ${editMode ? "room-btn--active" : ""}`}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? <><Check size={14} /> Done</> : <><Pencil size={14} /> Arrange</>}
        </button>
        <button className="room-btn" onClick={() => setShowSearch(true)}>
          <Plus size={14} /> Add to Shelf
        </button>
        {!editMode && (
          <button className="room-btn" onClick={handleCapture}><Camera size={14} /></button>
        )}
      </div>

      <div className="reading-room__label">
        <span className="reading-room__count">{shelfBookCount}</span>
        <span className="reading-room__word">{shelfBookCount === 1 ? "book" : "books"}</span>
      </div>

      <div className="reading-room__shelves">
        {shelves.map((shelfItems, si) => (
          <ShelfPlank
            key={si}
            items={shelfItems}
            shelfIndex={si}
            entryMap={entryMap}
            editMode={editMode}
            isDragOver={dragOverShelf === si}
            onBookClick={handleBookClick}
            onItemPointerDown={handlePointerDown}
            onRemoveItem={handleRemoveItem}
            draggingItem={dragging}
          />
        ))}
      </div>

      {editMode && (
        <ItemTray
          decorations={room.decorations}
          placedDecoIds={placedDecoIds}
          onTrayDragStart={handleTrayDragStart}
        />
      )}

      {room.saveError && (
        <div className="room-save-error">Couldn't save — your changes may not persist.</div>
      )}

      {room.newUnlocks.length > 0 && (
        <UnlockToast
          items={room.newUnlocks}
          decorations={room.decorations}
          onDismiss={room.dismissUnlock}
          onPlace={() => { room.dismissUnlock(); setEditMode(true); }}
        />
      )}

      {showSearch && (
        <ShelfBookSearch
          onSelect={handleAddDisplayBook}
          onClose={() => setShowSearch(false)}
        />
      )}

      {bookInfo && (
        <BookInfoPanel
          book={bookInfo}
          onClose={() => setBookInfo(null)}
          onLogBook={() => {
            setBookInfo(null);
            onBookClick({ prefill: true, title: bookInfo.title, author: bookInfo.author, cover_url: bookInfo.cover_url, isbn: bookInfo.isbn });
          }}
        />
      )}

      <div ref={ghostRef} className="drag-ghost" style={{ display: "none" }}>
        {dragging?.item?.type === "book" || dragging?.item?.type === "display" ? "📖" : "✦"}
      </div>
    </div>
  );
}
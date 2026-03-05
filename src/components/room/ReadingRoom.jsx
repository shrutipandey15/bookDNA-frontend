import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Pencil, Check, Camera, Plus } from "lucide-react";
import { useJournal } from "../../contexts/JournalContext";
import { useRoomData } from "./hooks/useRoomData";
import { useRoomDrag } from "./hooks/useRoomDrag";
import { useRoomCapture } from "./hooks/useRoomCapture";
import { buildDefaultLayout } from "./utils/roomDefaults";
import ShelfPlank from "./ShelfPlank";
import ItemTray from "./ItemTray";
import ShelfBookSearch from "./ShelfBookSearch";
import BookInfoPanel from "./BookInfoPanel";
import UnlockToast from "./ui/UnlockToast";
import "./ReadingRoom.css";

export default function ReadingRoom({ onBookClick, username }) {
  const { entries } = useJournal();
  const room = useRoomData();
  const [editMode, setEditMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [bookInfo, setBookInfo] = useState(null);
  const roomRef = useRef(null);

  const shelves = room.layout?.shelves || [[], [], []];
  const shelvesRef = useRef(shelves);
  shelvesRef.current = shelves;

  const { capturing, capture } = useRoomCapture(roomRef, username);
  const { dragging, dragOverShelf, ghostRef, startDrag } = useRoomDrag(shelvesRef, (s) => room.save(s));

  // Load room on mount
  useEffect(() => { room.load(); }, [room.load]);

  // Auto-populate on first visit
  useEffect(() => {
    if (!room.loading && room.layout === null && entries.length > 0) {
      room.save(buildDefaultLayout(entries).shelves);
    }
  }, [room.loading, room.layout, entries]);

  // Auto-sync new journal books to shelf
  useEffect(() => {
    if (!room.loading && room.layout && entries.length > 0) {
      const roomBookIds = new Set();
      for (const shelf of shelves) for (const item of shelf) if (item.type === "book") roomBookIds.add(item.id);
      const missing = entries.filter(e => !roomBookIds.has(e.id));
      if (missing.length > 0) {
        const newShelves = shelves.map(s => [...s]);
        for (const entry of missing) {
          const idx = newShelves.findIndex(s => s.length < 10);
          const ti = idx >= 0 ? idx : 0;
          const lastBook = newShelves[ti].reduce((a, item, i) => item.type === "book" ? i : a, -1);
          newShelves[ti].splice(lastBook + 1, 0, { type: "book", id: entry.id });
        }
        room.save(newShelves);
      }
    }
  }, [room.loading, room.layout, entries]);

  // Listen for unlock events
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

  const placedDecoIds = useMemo(() => {
    const ids = [];
    for (const shelf of shelves) for (const item of shelf) if (item.type === "deco") ids.push(item.id);
    return ids;
  }, [shelves]);

  const shelfBookCount = useMemo(() => {
    let c = 0;
    for (const shelf of shelves) for (const item of shelf) if (item.type === "book" || item.type === "display") c++;
    return c;
  }, [shelves]);

  // Toggle book orientation (vertical ↔ horizontal)
  const handleToggleOrientation = useCallback((shelfIdx, itemIdx) => {
    const newShelves = shelvesRef.current.map(s => [...s]);
    const item = { ...newShelves[shelfIdx][itemIdx] };
    item.orientation = item.orientation === "horizontal" ? "vertical" : "horizontal";
    newShelves[shelfIdx][itemIdx] = item;
    room.save(newShelves);
  }, [room]);

  const handleRemoveItem = useCallback((shelfIdx, itemIdx) => {
    const newShelves = shelvesRef.current.map(s => [...s]);
    newShelves[shelfIdx].splice(itemIdx, 1);
    room.save(newShelves);
  }, [room]);

  const handleTrayDragStart = useCallback((e, decoId) => {
    startDrag(e, -1, -1, { type: "deco", id: decoId }, true);
  }, [startDrag]);

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
    const idx = newShelves.findIndex(s => s.length < 10);
    newShelves[idx >= 0 ? idx : 0].push(displayItem);
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

  if (room.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-glyph">◈</div>
        <div className="loading-text">Building your room...</div>
      </div>
    );
  }

  return (
    <div className="reading-room" ref={roomRef}>
      <div className="reading-room__glow" />

      <div className="reading-room__controls">
        <button className={`room-btn ${editMode ? "room-btn--active" : ""}`} onClick={() => setEditMode(!editMode)}>
          {editMode ? <><Check size={14} /> Done</> : <><Pencil size={14} /> Arrange</>}
        </button>
        <button className="room-btn" onClick={() => setShowSearch(true)}>
          <Plus size={14} /> Add to Shelf
        </button>
        {!editMode && (
          <button className="room-btn" onClick={capture} disabled={capturing}>
            {capturing ? "✦ Capturing..." : <Camera size={14} />}
          </button>
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
            onItemPointerDown={startDrag}
            onRemoveItem={handleRemoveItem}
            onToggleOrientation={handleToggleOrientation}
            draggingItem={dragging}
          />
        ))}
      </div>

      {editMode && <ItemTray decorations={room.decorations} placedDecoIds={placedDecoIds} onTrayDragStart={handleTrayDragStart} />}

      {room.saveError && <div className="room-save-error">Couldn't save — your changes may not persist.</div>}

      {room.newUnlocks.length > 0 && (
        <UnlockToast items={room.newUnlocks} decorations={room.decorations} onDismiss={room.dismissUnlock} onPlace={() => { room.dismissUnlock(); setEditMode(true); }} />
      )}

      {showSearch && <ShelfBookSearch onSelect={handleAddDisplayBook} onClose={() => setShowSearch(false)} />}

      {bookInfo && (
        <BookInfoPanel
          book={bookInfo}
          onClose={() => setBookInfo(null)}
          onLogBook={() => { setBookInfo(null); onBookClick({ prefill: true, title: bookInfo.title, author: bookInfo.author, cover_url: bookInfo.cover_url, isbn: bookInfo.isbn }); }}
        />
      )}

      <div ref={ghostRef} className="drag-ghost" style={{ display: "none" }}>
        {dragging?.item?.type === "book" || dragging?.item?.type === "display" ? "📖" : "✦"}
      </div>
    </div>
  );
}
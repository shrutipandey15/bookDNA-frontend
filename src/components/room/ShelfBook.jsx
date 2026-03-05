import { EMOTIONS, getPrimaryEmotion } from "../../services/emotions";

/**
 * ShelfBook — a single book on the shelf.
 * Supports two orientations:
 *   - "vertical" (default): standing upright, spine facing out
 *   - "horizontal": lying flat, cover/top visible, stackable
 *
 * Horizontal books are shorter and wider — they look like a
 * small stack of 1-3 books lying on their side.
 */
export default function ShelfBook({ entry, index, editMode, isDragging, isHorizontal, onClick, onPointerDown, onToggleOrientation }) {
  const emo = getPrimaryEmotion(entry);
  const secondaryEmo = entry.emotions?.[1] ? EMOTIONS[entry.emotions[1].emotion_id] : null;
  const intensity = entry.intensity || 5;
  const seed = (entry.title || "").length + (entry.author || "").length;

  const spineColor = entry._spineColor || emo.color;
  const topEdge = secondaryEmo?.color || spineColor;

  if (isHorizontal) {
    // Lying flat — width is the "height" of the book, height is the spine thickness
    const bookWidth = 80 + ((seed % 5) - 2) * 4; // 72-88px
    const bookThick = 16 + intensity * 1.4;        // 17-30px

    return (
      <div
        className={`shelf-book-h ${editMode ? "shelf-book-h--edit" : ""} ${isDragging ? "shelf-book-h--dragging" : ""}`}
        style={{
          "--bw": `${bookWidth}px`,
          "--bt": `${bookThick}px`,
          "--spine-color": spineColor,
          "--top-edge": topEdge,
          "--delay": `${index * 0.06}s`,
          touchAction: editMode ? "none" : undefined,
        }}
        onClick={editMode ? undefined : onClick}
        onPointerDown={editMode ? (e) => { e.stopPropagation(); onPointerDown(e); } : undefined}
        title={`${entry.title} — ${entry.author || "Unknown"}`}
      >
        {/* Top face (what you see when a book lies flat) */}
        <div className="shelf-book-h__top">
          <span className="shelf-book-h__title">{entry.title}</span>
        </div>
        {/* Spine edge visible from the front */}
        <div className="shelf-book-h__spine" />
        {/* Edit controls */}
        {editMode && (
          <button className="shelf-book-h__flip" onClick={(e) => { e.stopPropagation(); onToggleOrientation?.(); }} title="Stand upright">↑</button>
        )}
      </div>
    );
  }

  // Vertical (standing) — original spine view
  const spineWidth = 20 + intensity * 1.8;
  const bookHeight = 148 + ((seed % 7) - 3);
  const lean = ((seed % 5) - 2) * 0.3;
  const isNew = entry.created_at && (Date.now() - new Date(entry.created_at).getTime()) < 86400000;

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
      {editMode && (
        <div className="shelf-book__edit-actions">
          <div className="shelf-book__grip">⠿</div>
          <button className="shelf-book__flip" onClick={(e) => { e.stopPropagation(); onToggleOrientation?.(); }} title="Lay flat">↻</button>
        </div>
      )}
    </div>
  );
}
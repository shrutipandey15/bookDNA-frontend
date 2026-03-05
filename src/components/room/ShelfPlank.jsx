import ShelfBook from "./ShelfBook";
import ShelfDecoration from "./ShelfDecoration";
import { toFakeEntry } from "./utils/displayBook";

export default function ShelfPlank({
  items, shelfIndex, entryMap, editMode, isDragOver,
  onBookClick, onItemPointerDown, onRemoveItem, onToggleOrientation, draggingItem,
}) {
  return (
    <div className="shelf-plank-unit">
      <div className={`shelf-plank-books ${isDragOver ? "shelf-plank-books--dragover" : ""}`}>
        {items.map((item, i) => {
          const isDragging = draggingItem?.shelfIdx === shelfIndex && draggingItem?.itemIdx === i;
          const isHorizontal = item.orientation === "horizontal";

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
                isHorizontal={isHorizontal}
                onClick={() => onBookClick(item, entry)}
                onPointerDown={(e) => onItemPointerDown(e, shelfIndex, i, item)}
                onToggleOrientation={() => onToggleOrientation(shelfIndex, i)}
              />
            );
          }

          if (item.type === "display") {
            const fakeEntry = toFakeEntry(item);
            return (
              <ShelfBook
                key={`${item.id}-${i}`}
                entry={fakeEntry}
                index={i}
                editMode={editMode}
                isDragging={isDragging}
                isHorizontal={isHorizontal}
                onClick={() => onBookClick(item, null)}
                onPointerDown={(e) => onItemPointerDown(e, shelfIndex, i, item)}
                onToggleOrientation={() => onToggleOrientation(shelfIndex, i)}
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
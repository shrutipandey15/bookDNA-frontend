import { useState, useCallback, useRef } from "react";

/**
 * Custom drag-and-drop using pointer events.
 * Works on mouse and touch.
 * Uses a ref for shelves to avoid stale closures.
 */
export function useRoomDrag(shelvesRef, onSave) {
  const [dragging, setDragging] = useState(null);
  const [dragOverShelf, setDragOverShelf] = useState(null);
  const ghostRef = useRef(null);

  const findTargetShelf = (cx, cy) => {
    const shelfEls = document.querySelectorAll(".shelf-plank-books");
    let target = null;
    shelfEls.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (cy > r.top - 30 && cy < r.bottom + 10 && cx > r.left && cx < r.right) target = i;
    });
    return target;
  };

  const startDrag = useCallback((e, shelfIdx, itemIdx, item, fromTray = false) => {
    e.preventDefault();
    setDragging({ shelfIdx, itemIdx, item, fromTray });

    const ghost = ghostRef.current;
    if (ghost) {
      ghost.style.display = "flex";
      ghost.style.left = `${e.clientX - 16}px`;
      ghost.style.top = `${e.clientY - 16}px`;
    }

    const dragInfo = { shelfIdx, itemIdx, item, fromTray };

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
        c.classList.contains("shelf-book") || c.classList.contains("shelf-book-h") || c.classList.contains("shelf-deco")
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
      onSave(newShelves);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [shelvesRef, onSave]);

  return { dragging, dragOverShelf, ghostRef, startDrag };
}
import { DECO_COMPONENTS } from "./utils/decorationSvgs";

export default function ShelfDecoration({ id, editMode, isDragging, onRemove, onPointerDown }) {
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
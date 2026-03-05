import { Lock } from "lucide-react";
import { DECO_COMPONENTS } from "./utils/decorationSvgs";

export default function ItemTray({ decorations, placedDecoIds, onTrayDragStart }) {
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
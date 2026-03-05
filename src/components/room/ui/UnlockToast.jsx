import { useEffect, useState } from "react";

const DECO_EMOJI = {
  plant_basic: "🪴", mug: "☕", bookend: "📐",
  pothos: "🌿", candle: "🕯️", sleeping_cat: "🐱",
  glyph_figurine: "◈", mini_dna_frame: "🖼️", crystal_prism: "🔮",
  broken_heart: "💔", mini_clock: "🕑",
};

export default function UnlockToast({ items, decorations, onDismiss, onPlace }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const decoInfo = items.map(id => {
    const info = decorations.find(d => d.id === id);
    return { id, name: info?.name || id, emoji: DECO_EMOJI[id] || "✦" };
  });

  return (
    <div className={`unlock-toast ${visible ? "unlock-toast--visible" : ""}`}>
      <div className="unlock-toast__icon">✦</div>
      <div className="unlock-toast__content">
        <div className="unlock-toast__title">New item unlocked</div>
        {decoInfo.map(d => (
          <div key={d.id} className="unlock-toast__item">
            <span className="unlock-toast__emoji">{d.emoji}</span>
            <span>{d.name}</span>
          </div>
        ))}
      </div>
      <button className="unlock-toast__place" onClick={onPlace}>Place it →</button>
      <button className="unlock-toast__close" onClick={onDismiss}>×</button>
    </div>
  );
}
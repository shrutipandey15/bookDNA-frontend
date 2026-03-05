/* All SVG decoration components for the Reading Room shelf */

export function DecoSucculent() {
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

export function DecoMug() {
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

export function DecoBookend() {
  return (
    <svg viewBox="0 0 20 40" className="shelf-deco__svg" aria-label="Bookend">
      <path d="M4 8 L4 38 L18 38 L18 34 L8 34 L8 8 Z" fill="#1a1a1e" stroke="#2a2a30" strokeWidth="0.5" />
      <path d="M4 8 L8 8 L8 34 L4 34 Z" fill="rgba(255,255,255,0.03)" />
    </svg>
  );
}

export function DecoPothos() {
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

export function DecoCandle() {
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

export function DecoCat() {
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

export function DecoFigurine({ color = "#C4553A" }) {
  return (
    <svg viewBox="0 0 24 40" className="shelf-deco__svg" aria-label="Personality Figurine">
      <ellipse cx="12" cy="37" rx="8" ry="2" fill="#1a1a1e" />
      <polygon points="12,6 20,20 16,20 16,34 8,34 8,20 4,20" fill={color} opacity="0.7" />
      <polygon points="12,6 20,20 16,20 16,34 8,34 8,20 4,20" fill="none" stroke={color} strokeWidth="0.5" opacity="0.9" />
      <polygon points="12,10 17,20 14,20 14,32 10,32 10,20 7,20" fill="rgba(255,255,255,0.05)" />
    </svg>
  );
}

export function DecoPrism() {
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

export function DecoFrame() {
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

export function DecoHeart() {
  return (
    <svg viewBox="0 0 28 32" className="shelf-deco__svg" aria-label="Cracked Heart">
      <path d="M14 28 Q4 20 4 13 Q4 6 10 6 Q14 6 14 10 Q14 6 18 6 Q24 6 24 13 Q24 20 14 28Z" fill="#6b3040" stroke="#8a4050" strokeWidth="0.5" />
      <path d="M14 10 L13 15 L15 18 L12 22 L14 26" fill="none" stroke="#B8964E" strokeWidth="0.8" opacity="0.6" />
      <path d="M13 15 L11 16" fill="none" stroke="#B8964E" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

export function DecoClock() {
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

/* Registry — maps decoration ID → component + metadata */
export const DECO_COMPONENTS = {
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
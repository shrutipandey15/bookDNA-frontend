import {
  Flame, CloudMoon, Zap, Heart, Coffee, Sparkles,
  Eye, Droplets, Lightbulb, Telescope, Leaf, Wind, Moon, HelpCircle,
} from "lucide-react";

// ── Shared emotion vocabulary [F1.5 / P2-9, P2-12] ──
// label / color / description are OWNED BY THE BACKEND and served from
// GET /emotions (B2.10). They are the single source of truth; do NOT edit them
// here to diverge from the server — that divergence is exactly the P2-9 bug
// (frontend "Melancholy" vs backend "Grief", etc.). The values below are a
// canonical SEED matching the served vocabulary so the first render is correct;
// `hydrateEmotions()` refreshes them from the server at boot.
//
// Icon + glyph are frontend PRESENTATION only (aesthetic choices, not data that
// can drift) and stay local. The server's `symbol` (emoji) is stored too, if a
// surface prefers it.
const PRESENTATION = {
  rage:        { Icon: Flame,     glyph: "◉" },
  dread:       { Icon: CloudMoon, glyph: "◐" },
  chaos:       { Icon: Zap,       glyph: "✦" },
  desire:      { Icon: Heart,     glyph: "♡" },
  comfort:     { Icon: Coffee,    glyph: "○" },
  catharsis:   { Icon: Sparkles,  glyph: "✧" },
  tenderness:  { Icon: Eye,       glyph: "◎" },
  grief:       { Icon: Droplets,  glyph: "◦" },
  wit:         { Icon: Lightbulb, glyph: "‡" },
  awe:         { Icon: Telescope, glyph: "✺" },
  longing:     { Icon: Leaf,      glyph: "❋" },
  devastation: { Icon: Wind,      glyph: "·" },
  two_am:      { Icon: Moon,      glyph: "☾" },
};

// Canonical seed — mirrors the backend's served vocabulary (slug/name/color/
// description). Kept in sync by hydrateEmotions() at runtime.
const SEED = [
  ["grief",       "Grief",       "#6B4F8E", "Loss, absence, mourning — the ache"],
  ["desire",      "Desire",      "#9B5B8E", "Longing, wanting, romantic tension"],
  ["rage",        "Rage",        "#C44B4B", "Fury, injustice, the urge to burn things down"],
  ["dread",       "Dread",       "#4B6B8E", "Anxiety, foreboding, existential unease"],
  ["comfort",     "Comfort",     "#8E6B4B", "Safety, warmth, being held by a book"],
  ["awe",         "Awe",         "#4B7B6B", "Wonder, scale, the sublime"],
  ["catharsis",   "Catharsis",   "#C9A96E", "Release, relief, the exhale after tension"],
  ["two_am",      "2AM",         "#3D4B6B", "Intimacy, rawness, the feeling of 3am thoughts"],
  ["chaos",       "Chaos",       "#6B8E4B", "Unpredictability, wild energy, plot velocity"],
  ["tenderness",  "Tenderness",  "#9B6B7B", "Gentle love, care, soft emotional moments"],
  ["wit",         "Wit",         "#7B8E4B", "Sharp humour, intelligence, the perfectly placed line"],
  ["longing",     "Longing",     "#5B6B8E", "Nostalgia, distance, wanting what you cannot have"],
  ["devastation", "Devastation", "#3D2B3D", "Complete emotional destruction — the books that ruin you"],
];

export const EMOTIONS = {};
for (const [slug, label, color, desc] of SEED) {
  EMOTIONS[slug] = { label, color, desc, symbol: null, ...(PRESENTATION[slug] || {}) };
}

// EMO_LIST holds live references to the EMOTIONS objects. hydrateEmotions mutates
// those objects IN PLACE, so this array never needs rebuilding.
export const EMO_LIST = Object.entries(EMOTIONS);

// Merge the server's canonical vocabulary into EMOTIONS in place. Called once at
// boot with the GET /emotions payload. label/color/description follow the server;
// Icon/glyph stay local. Unknown slugs are added defensively.
export function hydrateEmotions(vocab) {
  for (const item of vocab?.emotions || []) {
    if (!EMOTIONS[item.slug]) {
      EMOTIONS[item.slug] = { ...(PRESENTATION[item.slug] || {}) };
      EMO_LIST.push([item.slug, EMOTIONS[item.slug]]);
    }
    Object.assign(EMOTIONS[item.slug], {
      label: item.name,
      color: item.color,
      desc: item.description,
      symbol: item.symbol,
    });
  }
}

export function getPrimaryEmotion(entry) {
  const firstEmo = entry?.emotions?.[0];
  const id = typeof firstEmo === "string" ? firstEmo : firstEmo?.emotion_id;
  return EMOTIONS[id] || { color: "#333", Icon: HelpCircle, label: "Unknown" };
}

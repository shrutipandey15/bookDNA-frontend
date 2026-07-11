import {
  Flame, CloudMoon, Zap, Heart, Coffee, Sparkles,
  Eye, Droplets, Lightbulb, Telescope, Leaf, Wind, Moon, HelpCircle,
} from "lucide-react";

// ── INTERIM canonical emotion vocabulary [F1.5 / P2-9, P2-12] ──
// The backend will publish the single source of truth for this vocabulary at
// B2.10 (backend Phase 2). Until that endpoint exists, this file is the stub the
// UI reads from. Slugs here MUST stay aligned with the backend's VALID_SLUGS
// (note: `two_am`, NOT the dead `2am` — see backend B1.2) so DNA results render.
// When B2.10 lands: fetch the served vocabulary and back EMOTIONS with it here —
// this is the only place that needs to change; consumers use the accessors below.
export const EMOTIONS = {
  rage:        { label: "Rage",        color: "#c4553a", Icon: Flame,     glyph: "◉", desc: "Righteous fury." },
  dread:       { label: "Dread",       color: "#5a5a8a", Icon: CloudMoon, glyph: "◐", desc: "A knot in your stomach." },
  chaos:       { label: "Chaos",       color: "#c47a3a", Icon: Zap,       glyph: "✦", desc: "Unhinged energy." },
  desire:      { label: "Desire",      color: "#6b3a5d", Icon: Heart,     glyph: "♡", desc: "Yearning and pining." },
  comfort:     { label: "Comfort",     color: "#7a8b6f", Icon: Coffee,    glyph: "○", desc: "Safety and warmth." },
  catharsis:   { label: "Catharsis",   color: "#5a8b6f", Icon: Sparkles,  glyph: "✧", desc: "The release after pain." },
  tenderness:  { label: "Seen",        color: "#b8964e", Icon: Eye,       glyph: "◎", desc: "Validation." },
  grief:       { label: "Melancholy",  color: "#3a5a6b", Icon: Droplets,  glyph: "◦", desc: "The beautiful sadness." },
  wit:         { label: "Wit",         color: "#8d5a9b", Icon: Lightbulb, glyph: "‡", desc: "Intellectually playful." },
  awe:         { label: "Awe",         color: "#4e8cb8", Icon: Telescope, glyph: "✺", desc: "The Sublime." },
  longing:     { label: "Nostalgia",   color: "#b87a4e", Icon: Leaf,      glyph: "❋", desc: "Bittersweet return." },
  devastation: { label: "Empty",       color: "#6a6a6a", Icon: Wind,      glyph: "·", desc: "No connection." },
  two_am:      { label: "2AM",         color: "#4b4b6a", Icon: Moon,      glyph: "☾", desc: "Unputdownable." },
};

export const EMO_LIST = Object.entries(EMOTIONS);

export function getPrimaryEmotion(entry) {
  const firstEmo = entry?.emotions?.[0];
  const id = typeof firstEmo === "string" ? firstEmo : firstEmo?.emotion_id;
  return EMOTIONS[id] || { color: "#333", Icon: HelpCircle, label: "Unknown" };
}
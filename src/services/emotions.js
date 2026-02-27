import {
  Flame, CloudMoon, Zap, Heart, Coffee, Sparkles,
  Eye, Droplets, Lightbulb, Telescope, Leaf, Wind, Moon, HelpCircle,
} from "lucide-react";

export const EMOTIONS = {
  rage:     { label: "Rage",      color: "#C4553A", Icon: Flame,     desc: "Righteous fury." },
  dread:    { label: "Dread",     color: "#5A5A8A", Icon: CloudMoon, desc: "A knot in your stomach." },
  chaos:    { label: "Chaos",     color: "#C47A3A", Icon: Zap,       desc: "Unhinged energy." },
  obsession:{ label: "Desire",    color: "#6B3A5D", Icon: Heart,     desc: "Yearning and pining." },
  comfort:  { label: "Comfort",   color: "#7A8B6F", Icon: Coffee,    desc: "Safety and warmth." },
  healing:  { label: "Catharsis", color: "#5A8B6F", Icon: Sparkles,  desc: "The release after pain." },
  seen:     { label: "Seen",      color: "#B8964E", Icon: Eye,       desc: "Validation." },
  grief:    { label: "Melancholy",color: "#3A5A6B", Icon: Droplets,  desc: "The beautiful sadness." },
  wit:      { label: "Wit",       color: "#8D5A9B", Icon: Lightbulb, desc: "Intellectually playful." },
  awe:      { label: "Awe",       color: "#4E8CB8", Icon: Telescope, desc: "The Sublime." },
  nostalgia:{ label: "Nostalgia", color: "#B87A4E", Icon: Leaf,      desc: "Bittersweet return." },
  nothing:  { label: "Empty",     color: "#6A6A6A", Icon: Wind,      desc: "No connection." },
  "2am":    { label: "2AM",       color: "#4B4B6A", Icon: Moon,      desc: "Unputdownable." },
};

export const EMO_LIST = Object.entries(EMOTIONS);

export function getPrimaryEmotion(entry) {
  const firstEmo = entry?.emotions?.[0];
  const id = typeof firstEmo === "string" ? firstEmo : firstEmo?.emotion_id;
  return EMOTIONS[id] || { color: "#333", Icon: HelpCircle, label: "Unknown" };
}

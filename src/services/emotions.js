export const EMOTIONS = {
  rage: { label: "Rage", color: "#C4553A", icon: "🔥" },
  comfort: { label: "Comfort", color: "#7A8B6F", icon: "🧣" },
  dread: { label: "Dread", color: "#5A5A8A", icon: "🌀" },
  healing: { label: "Healing", color: "#5A8B6F", icon: "🌿" },
  obsession: { label: "Obsession", color: "#6B3A5D", icon: "💜" },
  grief: { label: "Grief", color: "#3A5A6B", icon: "🌊" },
  seen: { label: "Seen", color: "#B8964E", icon: "👁" },
  chaos: { label: "Chaos", color: "#C47A3A", icon: "⚡" },
  nothing: { label: "Nothing", color: "#6A6A6A", icon: "◻️" },
  "2am": { label: "2AM", color: "#7A5A9B", icon: "🌙" },
};

export const EMO_LIST = Object.entries(EMOTIONS);

export function getPrimaryEmotion(entry) {
  const id = entry?.emotions?.[0]?.emotion_id;
  return EMOTIONS[id] || { color: "#666", icon: "◈", label: "?" };
}
export const EMOTIONS = {
  rage: { 
    label: "Rage", 
    color: "#C4553A", 
    icon: "🔥",
    desc: "Righteous fury." 
  },
  dread: { 
    label: "Dread", 
    color: "#5A5A8A", 
    icon: "🌑",
    desc: "A knot in your stomach."
  },
  chaos: { 
    label: "Chaos", 
    color: "#C47A3A", 
    icon: "⚡",
    desc: "Unhinged energy."
  },
  obsession: { 
    label: "Desire",
    color: "#6B3A5D", 
    icon: "🩸",
    desc: "Yearning and pining."
  },
  comfort: { 
    label: "Comfort", 
    color: "#7A8B6F", 
    icon: "🍵",
    desc: "Safety and warmth."
  },
  healing: { 
    label: "Catharsis",
    color: "#5A8B6F", 
    icon: "✨",
    desc: "The release after pain."
  },
  seen: { 
    label: "Seen", 
    color: "#B8964E", 
    icon: "👁️",
    desc: "Validation."
  },
  grief: { 
    label: "Melancholy",
    color: "#3A5A6B", 
    icon: "💧",
    desc: "The beautiful sadness."
  },
  wit: { 
    label: "Wit", 
    color: "#8D5A9B", 
    icon: "🧠",
    desc: "Intellectually playful."
  },
  awe: { 
    label: "Awe", 
    color: "#4E8CB8", 
    icon: "🌌",
    desc: "The Sublime."
  },
  nostalgia: { 
    label: "Nostalgia", 
    color: "#B87A4E", 
    icon: "🍂",
    desc: "Bittersweet return."
  },
  nothing: { 
    label: "Empty",
    color: "#6A6A6A", 
    icon: "🌫️",
    desc: "No connection."
  },
  "2am": { 
    label: "2AM", 
    color: "#4B4B6A", 
    icon: "🌙",
    desc: "Unputdownable."
  },
};

export const EMO_LIST = Object.entries(EMOTIONS);

export function getPrimaryEmotion(entry) {
  const firstEmo = entry?.emotions?.[0];
  const id = typeof firstEmo === "string" ? firstEmo : firstEmo?.emotion_id;
  return EMOTIONS[id] || { color: "#333", icon: "◈", label: "Unknown" };
}
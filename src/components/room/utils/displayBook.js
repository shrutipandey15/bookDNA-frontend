/* Muted book-like palette for display books (not in journal) */
const DISPLAY_PALETTE = [
  "#6b3333", "#3d5e3a", "#334a6b", "#8a7340",
  "#5e3a5e", "#4a5560", "#7a4a30", "#5a6040",
  "#3a5a5a", "#5c3028", "#44506a", "#6a5a3a",
];

export function hashTitle(title) {
  return (title || "").split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
}

export function getDisplaySpineColor(title) {
  const hash = hashTitle(title);
  return DISPLAY_PALETTE[Math.abs(hash) % DISPLAY_PALETTE.length];
}

export function toFakeEntry(item) {
  return {
    id: item.id,
    title: item.title || "Unknown",
    author: item.author,
    cover_url: item.cover_url,
    intensity: 5,
    emotions: [],
    created_at: null,
    _spineColor: getDisplaySpineColor(item.title),
  };
}
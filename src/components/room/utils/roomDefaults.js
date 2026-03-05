/**
 * Generate a default room layout from the user's entries.
 * Called once when room_layout is null (first visit).
 */
export function buildDefaultLayout(entries) {
  const books = entries.slice(0, 20).map(e => ({ type: "book", id: e.id }));

  const top = books.slice(0, 5);
  const mid = books.slice(5, 12);
  const bot = books.slice(12, 20);

  if (top.length >= 2) top.splice(2, 0, { type: "deco", id: "plant_basic" });
  else top.push({ type: "deco", id: "plant_basic" });

  mid.push({ type: "deco", id: "mug" });

  if (bot.length > 0) bot.splice(0, 0, { type: "deco", id: "bookend" });
  else bot.push({ type: "deco", id: "bookend" });

  return { shelves: [top, mid, bot] };
}
/**
 * Honest error state for the shelf. [F1.2 / P5-2]
 *
 * Rendered ONLY when a fetch genuinely failed and we have nothing cached to
 * show — never for an empty shelf (that is EmptyShelf's job). The copy is keyed
 * off the error kind so a rate-limit reads differently from a server outage.
 */

const COPY = {
  rate_limited: {
    title: "Too many requests",
    sub: "You've hit a rate limit. Wait a moment, then try again.",
  },
  server: {
    title: "Couldn't reach your shelf",
    sub: "Something went wrong on our end. Your books are safe — this is a loading problem, not a data problem.",
  },
  offline: {
    title: "You appear to be offline",
    sub: "We couldn't reach the server. Check your connection and try again.",
  },
  client: {
    title: "Couldn't load your shelf",
    sub: "The request was rejected. Try again, or sign out and back in.",
  },
};

export default function ShelfError({ error, onRetry }) {
  const kind = error?.kind || "server";
  const { title, sub } = COPY[kind] || COPY.server;

  return (
    <div className="empty-state" role="alert" aria-live="assertive">
      <div className="empty-glyph">⚠</div>
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
      {error?.status ? (
        <div className="label-sm" style={{ marginTop: 8, opacity: 0.6 }}>
          error {error.status}
        </div>
      ) : null}
      {onRetry && (
        <button className="btn" style={{ marginTop: 20 }} onClick={onRetry}>
          try again
        </button>
      )}
    </div>
  );
}

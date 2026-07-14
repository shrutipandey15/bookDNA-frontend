import { EMOTIONS } from "../../services/emotions";

/**
 * The evolution view — the return mechanic. [F7.3]
 *
 * The insight is THE GAP between who you've been (the enduring, unweighted profile)
 * and who you've been lately (the recency-weighted current profile). Drift must be
 * legible in one second. Charts always carry a TEXT EQUIVALENT — the shift is never
 * conveyed by shape or colour alone. [F7.8]
 *
 * Data is the backend's `profiles.{enduring,current}` frequency vectors plus a
 * scalar `drift` (0..1). We describe the shift factually; we do not author insight prose.
 */
const emoLabel = (slug) => EMOTIONS[slug]?.label?.toLowerCase() || slug;
const emoColor = (slug) => EMOTIONS[slug]?.color || "var(--ink)";

const DRIFT_VISIBLE = 0.1; // below this the profiles are effectively steady

function topSlug(vec) {
  let best = null, bestW = 0;
  for (const [slug, w] of Object.entries(vec || {})) {
    if (w > bestW) { best = slug; bestW = w; }
  }
  return best;
}

function rows(vec, cap = 4) {
  const total = Object.values(vec || {}).reduce((s, w) => s + w, 0) || 1;
  return Object.entries(vec || {})
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, cap)
    .map(([slug, w]) => ({ slug, pct: Math.round((w / total) * 100) }));
}

// A stacked composition bar with a text equivalent supplied by the caller.
function Composition({ vec }) {
  const parts = rows(vec);
  if (!parts.length) return null;
  const text = parts.map((p) => `${emoLabel(p.slug)} ${p.pct}%`).join(", ");
  return (
    <div className="evo-comp" role="img" aria-label={text}>
      {parts.map((p) => (
        <span
          key={p.slug}
          className="evo-comp-seg"
          style={{ width: `${p.pct}%`, background: emoColor(p.slug) }}
          title={`${emoLabel(p.slug)} ${p.pct}%`}
        />
      ))}
    </div>
  );
}

export default function EvolutionView({ profiles, drift = 0 }) {
  const enduring = profiles?.enduring;
  const current = profiles?.current;
  if (!enduring && !current) return null;

  const fromTop = topSlug(enduring);
  const toTop = topSlug(current);
  const moved = drift >= DRIFT_VISIBLE && fromTop && toTop && fromTop !== toTop;

  return (
    <section className="evo" aria-labelledby="evo-title">
      <h2 id="evo-title" className="dna-section-label">What's changed</h2>

      {moved ? (
        <div className="evo-drift">
          <div className="evo-drift-arrow">
            <span className="evo-drift-from" style={{ color: emoColor(fromTop) }}>{emoLabel(fromTop)}</span>
            <span className="evo-drift-mark" aria-hidden="true">→</span>
            <span className="evo-drift-to" style={{ color: emoColor(toTop) }}>{emoLabel(toTop)}</span>
          </div>
          {/* The text equivalent — the shift stated plainly, from the data. [F7.8] */}
          <p className="evo-drift-summary">
            Enduringly, you read toward {emoLabel(fromTop)}. Lately, {emoLabel(toTop)}.
          </p>
        </div>
      ) : (
        <p className="evo-drift-summary">
          {toTop ? <>Steady — still {emoLabel(toTop)}.</> : "Not enough movement to read yet."}
        </p>
      )}

      {/* The gap IS the insight: enduring vs. lately, contrasted. */}
      <div className="evo-gap">
        <div className="evo-gap-col">
          <div className="label-sm">who you've been</div>
          <div className="evo-gap-name">{fromTop ? emoLabel(fromTop) : "—"}</div>
          <Composition vec={enduring} />
        </div>
        <div className="evo-gap-col">
          <div className="label-sm">who you've been lately</div>
          <div className="evo-gap-name">{toTop ? emoLabel(toTop) : "—"}</div>
          <Composition vec={current} />
        </div>
      </div>
    </section>
  );
}

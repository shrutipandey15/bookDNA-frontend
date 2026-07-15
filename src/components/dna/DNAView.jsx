import { EMOTIONS } from "../../services/emotions";
import DNACard from "../DNACard";
import DNAGate from "./DNAGate";
import Insight from "./Insight";
import EvolutionView from "./EvolutionView";
import LockedInsights from "./LockedInsights";
import { MIN_BOOKS } from "./constants";
import "./DNAView.css";

/**
 * The DNA / Insight view. [Phase 7]
 *
 * Renders the backend's private "v2" mirror (app/services/dna_insights.build_dna):
 * gate on `enough`, then most-specific-first — insights, evolution, the shape of
 * you, and the archetype DEMOTED to a shorthand at the bottom. NO mystical framing;
 * facts with their receipts. All prose is server-templated — we render, never author.
 */

// Analytics/prose surfaces use the plain word ("devastation"), which reads
// grammatically inline ("you read toward devastation"); the first-person phrase
// is for the tagging surfaces. [VISION §4 — `name` is the single-word form.]
const emoLabel = (slug) => EMOTIONS[slug]?.name?.toLowerCase() || slug;
const emoColor = (slug) => EMOTIONS[slug]?.color || "var(--ink)";

// Turn a { slug: weight } frequency vector into a sorted, capped list.
function vectorRows(vec, cap = 6) {
  return Object.entries(vec || {})
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, cap)
    .map(([slug, weight]) => ({ slug, weight }));
}

// THE SHAPE OF YOU — the composition portrait (recency-weighted), not the label.
// The row text (emotion + share) is itself the text equivalent; nothing is
// colour-only. [F7.8]
function Portrait({ current }) {
  const rows = vectorRows(current);
  if (!rows.length) return null;
  const max = rows[0].weight || 1;
  return (
    <section className="dna-portrait" aria-labelledby="dna-portrait-title">
      <h2 id="dna-portrait-title" className="dna-section-label">The shape of you</h2>
      <ul className="dna-portrait-list">
        {rows.map((r) => (
          <li key={r.slug} className="dna-portrait-row">
            <span className="dna-portrait-name">{emoLabel(r.slug)}</span>
            <span className="dna-portrait-track" aria-hidden="true">
              <span className="dna-portrait-fill" style={{ width: `${(r.weight / max) * 100}%`, background: emoColor(r.slug) }} />
            </span>
            <span className="dna-portrait-count">{Math.round(r.weight * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DNAView({ profile, username, onSave, onEditReadFor, cardRef, bookCount = 0 }) {
  const count = profile?.book_count ?? bookCount;
  const needed = profile?.needed ?? MIN_BOOKS;
  // The mirror auto-computes on read; `enough` is the honest gate. Treat present
  // content as enough too, so a stale cache never hides real data.
  const enough = profile?.enough === true || !!(profile?.insights?.length) || !!profile?.archetype;

  // Below the gate — the honest empty state. NEVER a fabricated insight. [F7.1]
  if (!enough) {
    return <DNAGate bookCount={count} minBooks={needed} message={profile?.message} />;
  }

  const insights = profile.insights || [];        // already ranked by surprise (backend)
  const [headline, ...rest] = insights;
  const readFor = profile.reads_for || [];
  const arch = profile.archetype;

  // The shareable card uses the legacy signature shape; adapt the v2 payload for it.
  const cardProfile = arch && {
    personality: arch,
    book_count: count,
    top_emotions: vectorRows(profile.profiles?.current, 5)
      .map((r) => ({ emotion_id: r.slug, count: Math.round(r.weight * 100) })),
  };

  return (
    <div className="dna-view">
      <header className="dna-view-head">
        <div className="label">· what your reading says ·</div>
        <h1 className="dna-view-h1">The Reading.</h1>
        {readFor.length > 0 ? (
          <p className="dna-readfor-line">
            you read for {readFor.map(emoLabel).join(" and ")}
            {onEditReadFor && <button className="dna-readfor-edit" onClick={onEditReadFor}>edit</button>}
          </p>
        ) : onEditReadFor && (
          <p className="dna-readfor-line">
            <button className="dna-readfor-edit" onClick={onEditReadFor}>tell us what you read for →</button>
          </p>
        )}
      </header>

      {/* THE HEADLINE INSIGHT — lead with the strongest, most specific thing.
          aria-live announces it without stealing focus. [F7.2 / F7.8] */}
      {headline && (
        <section className="dna-headline" aria-labelledby="dna-reading-title" aria-live="polite">
          <h2 id="dna-reading-title" className="dna-section-label">The reading</h2>
          <Insight insight={headline} headline />
        </section>
      )}

      {/* WHAT'S CHANGED — the return mechanic. [F7.3] */}
      <EvolutionView profiles={profile.profiles} drift={profile.drift} />

      {/* THE SHAPE OF YOU — the fingerprint, not the label. */}
      <Portrait current={profile.profiles?.current} />

      {/* MORE — other insights, ranked by surprise. Basis on every one. [F7.2] */}
      {rest.length > 0 && (
        <section className="dna-more" aria-labelledby="dna-more-title">
          <h2 id="dna-more-title" className="dna-section-label">More</h2>
          <ul className="dna-more-list">
            {rest.map((i) => (
              <li key={`${i.category}-${i.variant}`}><Insight insight={i} /></li>
            ))}
          </ul>
        </section>
      )}

      {/* THE ARCHETYPE — demoted. A hook, not the destination. [F7.2] */}
      {arch && (
        <section className="dna-archetype" aria-labelledby="dna-arch-title">
          <h2 id="dna-arch-title" className="dna-section-label">The shorthand</h2>
          <div className="dna-arch-strip">
            <span className="dna-arch-glyph" style={{ color: arch.color }}>{arch.glyph || "◈"}</span>
            <div>
              <div className="dna-arch-name">{arch.name}</div>
              {arch.description && <p className="dna-arch-desc">{arch.description}</p>}
            </div>
          </div>
          <div className="dna-arch-card">
            <DNACard ref={cardRef} profile={cardProfile} username={username} allowShare onSave={onSave} size="small" />
          </div>
        </section>
      )}

      {/* NOT YET — locked, WITH the real reason. [F7.4] */}
      <LockedInsights locked={profile.locked} />
    </div>
  );
}

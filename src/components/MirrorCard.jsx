import { useState, useEffect } from "react";
import { getInsight, getWeeklyMemory } from "../services/api";
import "./MirrorCard.css";

/**
 * The Mirror — a weekly insight + a resurfaced memory. [F2.5 / B2.6]
 *
 * Calm, personal, and HONEST: the backend returns null when there isn't enough
 * to say yet, and we render nothing rather than inventing a sentence. No numbers,
 * no comparison — just the app noticing something true about your reading.
 */
export default function MirrorCard() {
  const [insight, setInsight] = useState(null);
  const [memory, setMemory] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([getInsight(), getWeeklyMemory()])
      .then(([i, m]) => {
        if (!alive) return;
        setInsight(i?.sentence || null);
        setMemory(m?.memory || null);
      })
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);

  // Honest empty: if there's genuinely nothing to surface, render nothing.
  if (!loaded || (!insight && !memory)) return null;

  return (
    <aside className="mirror" aria-label="The Mirror">
      <div className="label mirror-eyebrow">· the mirror ·</div>
      {insight && (
        <p className="mirror-insight">{insight}</p>
      )}
      {memory && (
        <div className="mirror-memory">
          <span className="mirror-memory-glyph" aria-hidden="true">↺</span>
          <p className="mirror-memory-text">{memory}</p>
        </div>
      )}
    </aside>
  );
}

import { EMOTIONS } from "../services/emotions";
import "./Panels.css";

export function Heatmap({ data }) {
  if (!data || data.total_books < 2) {
    return <div className="empty-state"><div className="empty-glyph">🌀</div><div className="empty-title">Add at least 2 books to see your heatmap</div></div>;
  }
  const { books, active_emotions, cells } = data;
  const cellMap = {};
  cells.forEach((c) => { cellMap[`${c.entry_id}-${c.emotion_id}`] = c.intensity; });

  return (
    <div className="heatmap-wrap">
      <div className="panel-label">EMOTION × BOOK MATRIX</div>
      <div className="hm-scroll">
        <div className="hm-grid" style={{ gridTemplateColumns: `100px repeat(${books.length}, 44px)` }}>
          <div />
          {books.map((b) => <div key={b.entry_id} className="hm-col-head">{b.title.slice(0, 5)}…</div>)}
          {active_emotions.map((eid) => {
            const em = EMOTIONS[eid];
            if (!em) return null;
            return [
              <div key={`l-${eid}`} className="hm-row-label"><span>{em.icon}</span> {em.label}</div>,
              ...books.map((b) => {
                const val = cellMap[`${b.entry_id}-${eid}`];
                return (
                  <div key={`${b.entry_id}-${eid}`} className="hm-cell"
                    style={{ background: val ? em.color : "#111114", opacity: val ? 0.3 + (val / 10) * 0.7 : 0.15 }}>
                    {val && <div className="hm-dot" />}
                  </div>
                );
              }),
            ];
          })}
        </div>
      </div>
    </div>
  );
}

export function Echoes({ entries }) {
  const echoes = entries.filter((e) => e.public_echo);
  if (!echoes.length) {
    return <div className="empty-state"><div className="empty-glyph">✦</div><div className="empty-title">Write a Public Echo on any entry to see it here</div><div className="empty-sub">Aesthetic, spoiler-free vibes — what the world sees</div></div>;
  }
  return (
    <div className="echoes-wrap">
      {echoes.map((entry, i) => {
        const primary = entry.emotions?.[0]?.emotion_id;
        const emo = EMOTIONS[primary] || { color: "#B8964E" };
        return (
          <div key={entry.id} className="echo-card" style={{ "--ec": emo.color, "--delay": `${i * 0.08}s` }}>
            <div className="echo-big-quote">"</div>
            <div className="echo-text">"{entry.public_echo}"</div>
            <div className="echo-meta">
              <div>
                <span className="echo-title">{entry.title}</span>
                <span className="echo-author"> — {entry.author}</span>
              </div>
              <div className="echo-emos">
                {entry.emotions?.slice(0, 3).map((e) => <span key={e.emotion_id}>{EMOTIONS[e.emotion_id]?.icon}</span>)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Stats({ stats }) {
  if (!stats || stats.total_books === 0) {
    return <div className="empty-state"><div className="empty-glyph">📊</div><div className="empty-title">Add books to see your stats</div></div>;
  }
  return (
    <div className="stats-wrap">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-val">{stats.total_books}</div><div className="stat-label">Books Logged</div></div>
        <div className="stat-card"><div className="stat-val">{stats.avg_intensity}</div><div className="stat-label">Avg Intensity</div></div>
        <div className="stat-card"><div className="stat-val">{stats.books_per_month}</div><div className="stat-label">Books / Month</div></div>
        <div className="stat-card"><div className="stat-val">{Math.round(stats.emotion_diversity * 100)}%</div><div className="stat-label">Emotion Diversity</div></div>
      </div>
      {stats.most_common_emotion && (
        <div className="stat-highlight">
          Your most felt emotion:{" "}
          <span style={{ color: EMOTIONS[stats.most_common_emotion]?.color }}>
            {EMOTIONS[stats.most_common_emotion]?.icon} {EMOTIONS[stats.most_common_emotion]?.label}
          </span>{" "}
          ({stats.most_common_emotion_count}×)
        </div>
      )}
      {stats.highest_intensity_book && (
        <div className="stat-highlight">
          Most intense read:{" "}
          <span style={{ color: "#C4553A" }}>{stats.highest_intensity_book.title}</span>{" "}
          ({stats.highest_intensity_book.intensity}/10)
        </div>
      )}
    </div>
  );
}

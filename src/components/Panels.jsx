import { LayoutGrid, BarChart2, Download } from "lucide-react";
import { EMOTIONS } from "../services/emotions";
import "./Panels.css";

export function Heatmap({ data }) {
  if (!data || data.total_books < 2) {
    return <div className="empty-state"><div className="empty-glyph"><LayoutGrid size={36} /></div><div className="empty-title">Add at least 2 books to see your heatmap</div></div>;
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
              <div key={`l-${eid}`} className="hm-row-label"><span><em.Icon size={13} color={em.color} /></span> {em.label}</div>,
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

export function Echoes({ entries, onShare }) {
  const echoes = entries.filter((e) => e.public_echo);
  if (!echoes.length) {
    return (
      <div className="empty-state">
        <div className="empty-glyph">✦</div>
        <div className="empty-title">No echoes found</div>
        <div className="empty-sub">The silence is loud.</div>
      </div>
    );
  }
  return (
    <div className="echoes-wrap">
      {echoes.map((entry, i) => {
        const primary = entry.emotions?.[0] || entry.emotions?.[0]?.emotion_id;
        const emoId = typeof primary === 'object' ? primary.emotion_id : primary;
        
        const emo = EMOTIONS[emoId] || { color: "#B8964E" };
        
        return (
          <div key={entry.entry_id || entry.id} className="echo-card" style={{ "--ec": emo.color, "--delay": `${i * 0.05}s` }}>
            <div className="echo-big-quote">"</div>
            <div className="echo-text">"{entry.public_echo}"</div>
            <div className="echo-meta">
              <div>
                <span className="echo-title">{entry.title}</span>
                <span className="echo-author"> — {entry.author}</span>
                {entry.display_name && (
                   <div className="echo-user">@{entry.username}</div>
                )}
              </div>
              {onShare && (
                <button 
                  className="echo-share-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(entry);
                  }}
                  title="Download Image"
                >
                  <Download size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
      <style>{`
        .echo-user { font-size: 0.75rem; color: #666; margin-top: 4px; }
        .echo-share-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .echo-share-btn:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

export function Stats({ stats }) {
  if (!stats || stats.total_books === 0) {
    return <div className="empty-state"><div className="empty-glyph"><BarChart2 size={36} /></div><div className="empty-title">Add books to see your stats</div></div>;
  }
  return (
    <div className="stats-wrap">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-val">{stats.total_books}</div><div className="stat-label">Books Logged</div></div>
        <div className="stat-card"><div className="stat-val">{stats.avg_intensity}</div><div className="stat-label">Avg Intensity</div></div>
        <div className="stat-card"><div className="stat-val">{stats.books_per_month}</div><div className="stat-label">Books / Month</div></div>
        <div className="stat-card"><div className="stat-val">{stats.emotion_diversity}%</div><div className="stat-label">Emotion Diversity</div></div>
      </div>
      {stats.most_common_emotion && (
        <div className="stat-highlight">
          Your most felt emotion:{" "}
          <span style={{ color: EMOTIONS[stats.most_common_emotion]?.color }}>
            {(() => { const em = EMOTIONS[stats.most_common_emotion]; return em ? <em.Icon size={14} color={em.color} style={{ display: 'inline', verticalAlign: 'middle' }} /> : null; })()} {EMOTIONS[stats.most_common_emotion]?.label}
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

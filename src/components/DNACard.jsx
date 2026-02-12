import { EMOTIONS } from "../services/emotions";
import "./DNACard.css";

export default function DNACard({ profile, username }) {
  if (!profile?.personality) return null;
  const p = profile.personality;
  const top = profile.top_emotions?.slice(0, 5) || [];
  const maxC = top[0]?.count || 1;

  return (
    <div className="dna-card" style={{ "--dc": p.color }}>
      <div className="dna-glow" />
      <div className="dna-header">
        <div>
          <div className="dna-label">BOOK DNA™</div>
          <div className="dna-sub">{profile.book_count} books · 2026</div>
        </div>
        <div className="dna-glyph">{p.glyph}</div>
      </div>
      <div className="dna-name">{p.name}</div>
      <div className="dna-desc">{p.description}</div>
      <div className="dna-divider" />
      <div className="dna-fp-label">EMOTIONAL FINGERPRINT</div>
      {top.map((t, i) => {
        const em = EMOTIONS[t.emotion_id];
        if (!em) return null;
        return (
          <div key={t.emotion_id} className="dna-bar-row" style={{ animationDelay: `${i * 0.1 + 0.3}s` }}>
            <span className="dna-bar-icon">{em.icon}</span>
            <span className="dna-bar-label">{em.label}</span>
            <div className="dna-bar-track">
              <div className="dna-bar-fill" style={{ width: `${(t.count / maxC) * 100}%`, background: em.color }} />
            </div>
            <span className="dna-bar-count">{t.count}</span>
          </div>
        );
      })}
      {p.blind_spots?.length > 0 && (
        <div className="dna-blinds">
          <div className="dna-section-label">BLIND SPOTS</div>
          {p.blind_spots.map((b, i) => (
            <div key={i} className="dna-blind">{b}</div>
          ))}
        </div>
      )}
      <div className="dna-footer">
        <span>bookdna.app</span>
        <span>@{username}</span>
      </div>
    </div>
  );
}

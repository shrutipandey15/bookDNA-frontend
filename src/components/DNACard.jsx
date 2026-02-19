import { forwardRef, useState } from "react";
import { EMOTIONS } from "../services/emotions";
import { generateShareToken } from "../services/api";
import ShareModal from "./ShareModal";
import "./DNACard.css";

const DNACard = forwardRef(function DNACard({ profile, username, allowShare = false, onSave }, ref) {
  const [showShare, setShowShare] = useState(false);
  const [shareToken, setShareToken] = useState(null);

  if (!profile?.personality) return null;

  const handleShareClick = async () => {
    try {
      const data = await generateShareToken();
      setShareToken(data.share_token);
      setShowShare(true);
    } catch (err) {
      console.error("Token error", err);
    }
  };

  const p = profile.personality;
  const top = profile.top_emotions?.slice(0, 5) || [];
  const maxC = top[0]?.count || 1;

  return (
    <div className="dna-wrapper">
      <div className="dna-card" ref={ref} style={{ "--dc": p.color }}>
        <div className="dna-glow" />
        <div className="dna-header">
          <div>
            <div className="dna-label">BOOK DNA™</div>
            <div className="dna-sub">{profile.book_count} books · {new Date().getFullYear()}</div>
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

      {allowShare && (
        <div className="dna-actions" style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button 
            className="dna-action-btn" 
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '10px 20px',
              borderRadius: '20px',
              color: 'white',
              cursor: 'pointer'
            }} 
            onClick={onSave}
          >
            📸 Save Card
          </button>
          <button 
            className="dna-action-btn" 
            style={{ 
              background: p.color, 
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: `0 4px 15px ${p.color}40`
            }} 
            onClick={handleShareClick}
          >
            ✦ Share My DNA
          </button>
        </div>
      )}

      <ShareModal 
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        endpoint={shareToken ? `/public/shared/${shareToken}/og` : null}
        filename={`dna-${username}.png`}
        shareToken={shareToken}
      />
    </div>
  );
});

export default DNACard;
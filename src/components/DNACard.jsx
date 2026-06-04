import { forwardRef, useState } from "react";
import { EMOTIONS } from "../services/emotions";
import { generateShareToken } from "../services/api";
import ShareModal from "./ShareModal";
import "./DNACard.css";

const DNACard = forwardRef(function DNACard({ profile, username, allowShare = false, onSave, size = "large" }, ref) {
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
  const top = (profile.top_emotions || []).slice(0, 5);
  const maxC = top[0]?.count || 1;
  const [first, ...rest] = (p.name || "").split(" ");
  const second = rest.join(" ");

  return (
    <div className="dna-wrapper">
      <div className={`dna-card anim-flip dna-card--${size}`} ref={ref} style={{ "--dc": p.color || "var(--oxblood)" }}>
        <span className="dna-corner dna-corner-tl">◈</span>
        <span className="dna-corner dna-corner-tr">◈</span>
        <span className="dna-corner dna-corner-bl">◈</span>
        <span className="dna-corner dna-corner-br">◈</span>
        <span className="dna-frame" aria-hidden="true" />

        <div className="dna-header">
          <div>
            <div className="dna-label">BOOK DNA · CARD 04 / 12</div>
            <div className="dna-vol">{profile.book_count || 0} VOLUMES · MMXXVI</div>
          </div>
          <div className="dna-glyph">{p.glyph || "◈"}</div>
        </div>

        <h2 className="dna-name">
          {first}{second && <><br /><em>{second}</em></>}
        </h2>
        {p.tagline && <div className="dna-tagline">“{p.tagline}”</div>}
        <p className="dna-blurb">{p.description}</p>

        <div className="dna-divider" />

        <div className="label dna-fp-label">emotional fingerprint</div>
        {top.map((t) => {
          const em = EMOTIONS[t.emotion_id];
          if (!em) return null;
          return (
            <div key={t.emotion_id} className="dna-bar-row">
              <span className="dna-dot" style={{ background: em.color, boxShadow: `0 0 6px ${em.color}` }} />
              <span className="dna-bar-label">{em.label.toLowerCase()}</span>
              <span className="dna-bar-track">
                <span className="dna-bar-fill" style={{ width: `${(t.count / maxC) * 100}%`, background: em.color }} />
              </span>
              <span className="dna-bar-count">{String(t.count).padStart(2, "0")}</span>
            </div>
          );
        })}

        {p.blind_spots?.length > 0 && (
          <div className="dna-blinds">
            <div className="label-sm">blind spots</div>
            <div className="dna-blind">{p.blind_spots.join(" · ")}</div>
          </div>
        )}

        <div className="dna-footer">
          <span>BOOKDNA.APP</span>
          <span>@{(username || "you").toUpperCase()}</span>
        </div>
      </div>

      {allowShare && (
        <div className="dna-actions">
          <button className="btn brass" onClick={onSave}>
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16 }}>Save</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>AS IMAGE</span>
          </button>
          <button className="btn ghost" onClick={handleShareClick}>share link →</button>
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

export function DnaReveal({ profile, username, onSave, archetypes = [] }) {
  if (!profile?.personality) return null;
  const p = profile.personality;
  const [first, ...rest] = (p.name || "").split(" ");
  const second = rest.join(" ");
  return (
    <div className="dna-reveal" style={{ "--dc": p.color || "var(--oxblood)" }}>
      <div className="dna-reveal-grid">
        <div>
          <div className="label dna-reveal-eyebrow">· your reading personality has been revealed ·</div>
          <h1 className="dna-reveal-h1">
            You are<br />
            <em>{first} {second}.</em>
          </h1>
          <p className="dna-reveal-dek">
            One of twelve archetypes — drawn from the geometry of your shelf.
            This is not a quiz result. It's a small portrait of the way you read.
          </p>
          {p.pull_quote && (
            <div className="dna-reveal-pull">
              “{p.pull_quote}”
            </div>
          )}
          <div className="dna-reveal-cta">
            <button className="btn brass" onClick={onSave}>
              <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16 }}>Save</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>AS IMAGE</span>
            </button>
            <span className="dna-reveal-note">regenerates as your shelf grows</span>
          </div>
        </div>

        <div className="dna-reveal-cardwrap">
          <div className="dna-reveal-halo" />
          <div className="dna-reveal-deck" />
          <div className="dna-reveal-cardtilt">
            <DNACard profile={profile} username={username} />
          </div>
        </div>
      </div>

      {archetypes.length > 0 && (
        <div className="dna-reveal-rail">
          <div className="label" style={{ marginBottom: 22 }}>· catalog of archetypes ·</div>
          <div className="dna-reveal-rail-grid">
            {archetypes.map((x, i) => {
              const current = x.name === p.name;
              return (
                <div key={x.id || i} className={`dna-arch-tile ${current ? "current" : ""}`} style={{ "--ac": x.color }}>
                  <div className="dna-arch-tile-top">
                    <div className="label-sm">{String(i + 1).padStart(2, "0")}</div>
                    <div className="dna-arch-tile-glyph">{x.glyph}</div>
                  </div>
                  <div className="dna-arch-tile-name">{x.name}</div>
                  {x.tagline && <div className="dna-arch-tile-tag">“{x.tagline}”</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

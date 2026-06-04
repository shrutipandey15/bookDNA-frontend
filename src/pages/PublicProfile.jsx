import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DNACard from "../components/DNACard";
import { EMOTIONS } from "../services/emotions";
import "./PublicProfile.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function PublicProfile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [card, setCard] = useState(null);
  const [echoes, setEchoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    Promise.all([
      fetch(`${API_BASE}/public/card/${username}`).then((r) => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`${API_BASE}/public/echoes/${username}`).then((r) => r.ok ? r.json() : Promise.reject(r.status)),
    ])
      .then(([cardData, echoData]) => {
        setCard(cardData);
        setEchoes(echoData.echoes || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err === 404 ? "Reader not found." : "Something went wrong.");
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-glyph">◈</div>
        <div className="loading-text">finding {username}…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" style={{ minHeight: "100vh" }}>
        <div className="empty-glyph">?</div>
        <div className="empty-title">{error}</div>
        <div className="empty-sub">This profile may be private or doesn't exist.</div>
        <Link to="/" className="back-btn">go home</Link>
      </div>
    );
  }

  const profile = card ? { personality: card.personality, top_emotions: card.top_emotions, book_count: card.book_count } : null;
  const archColor = profile?.personality?.color || "var(--oxblood)";

  return (
    <div className="pp-page">
      <header className="pp-header">
        <Link to="/" className="pp-brand">Book&nbsp;<em>DNA</em></Link>
        <div>
          <Link to="/" className="btn brass" style={{ fontSize: 12 }}>
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 14 }}>
              {currentUser ? "My" : "Get"}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>
              {currentUser ? "DASHBOARD" : "YOUR DNA"}
            </span>
          </Link>
        </div>
      </header>

      <main className="pp-main">
        <div className="pp-bio">
          <div className="pp-avatar" style={{ background: `linear-gradient(135deg, ${archColor}, var(--plum))` }}>
            {(card?.display_name || username).charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>· public reader ·</div>
            <h1 className="pp-h1">{card?.display_name || username}</h1>
            <div className="pp-handle">@{username}</div>
            {card?.bio && (
              <p className="pp-bio-text" style={{ borderLeft: `2px solid ${archColor}` }}>{card.bio}</p>
            )}
            <div className="pp-stats">
              <Stat label="volumes" value={card?.book_count ?? 0} />
              <Stat label="echoes"  value={echoes.length} />
              <Stat label="archetype" value={profile?.personality?.name || "—"} color={archColor} small />
            </div>
          </div>
        </div>

        <div className="rule-dbl" style={{ margin: "32px 0" }} />

        {profile?.personality && (
          <div className="pp-section">
            <div className="label" style={{ marginBottom: 18 }}>· reading personality ·</div>
            <DNACard profile={profile} username={username} allowShare={false} />
          </div>
        )}

        {echoes.length > 0 && (
          <div className="pp-section">
            <div className="label" style={{ marginBottom: 18 }}>· their echoes ·</div>
            <div className="pp-echoes">
              {echoes.slice(0, 6).map((echo) => {
                const first = echo.emotions?.[0];
                const id = typeof first === "string" ? first : first?.emotion_id;
                const em = EMOTIONS[id];
                const color = em?.color || "var(--ink)";
                return (
                  <div key={echo.entry_id} className="pp-echo card" style={{ borderLeft: `3px solid ${color}` }}>
                    {em && <div className="label-sm" style={{ color, marginBottom: 8 }}>◉ {em.label.toLowerCase()}</div>}
                    <div className="pp-echo-quote">“{echo.public_echo}”</div>
                    <div className="pp-echo-foot">
                      <div className="pp-echo-title">{echo.title}</div>
                      {echo.author && <div className="label-sm">{echo.author}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, color, small }) {
  return (
    <div className="pp-stat">
      <div className="label-sm">{label}</div>
      <div className="pp-stat-val" style={{ color: color || "var(--ink)", fontSize: small ? 18 : 24 }}>{value}</div>
    </div>
  );
}

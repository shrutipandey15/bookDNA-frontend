import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DNACard from "../components/DNACard";
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
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${API_BASE}/public/card/${username}`).then((r) =>
        r.ok ? r.json() : Promise.reject(r.status)
      ),
      fetch(`${API_BASE}/public/echoes/${username}`).then((r) =>
        r.ok ? r.json() : Promise.reject(r.status)
      ),
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
        <div className="loading-text">Finding {username}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pp-error">
        <div className="pp-error-glyph">?</div>
        <div className="pp-error-title">{error}</div>
        <div className="pp-error-sub">This profile may be private or doesn't exist.</div>
        <Link to="/" className="pp-home-btn">Go Home</Link>
      </div>
    );
  }

  // Build a profile object that DNACard expects
  const profile = card
    ? {
        personality: card.personality,
        top_emotions: card.top_emotions,
        book_count: card.book_count,
      }
    : null;

  return (
    <div className="app public-view">
      <header className="header">
        <div className="brand">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="logo">BOOK <span>DNA</span></div>
          </Link>
        </div>
        <div className="header-right">
          <Link to="/" className="gen-btn">
            {currentUser ? "My Dashboard" : "Get Your Own"}
          </Link>
        </div>
      </header>

      <main className="pp-main">
        <div className="pp-label">
          {card?.display_name || username}'s Reading Personality
        </div>

        {profile?.personality && (
          <DNACard profile={profile} username={username} allowShare={false} />
        )}

        {echoes.length > 0 && (
          <div className="pp-echoes">
            <h3 className="pp-echoes-title">Echoes</h3>
            {echoes.map((echo) => (
              <div key={echo.entry_id} className="pp-echo">
                <div className="pp-echo-book">{echo.title}</div>
                <div className="pp-echo-text">"{echo.public_echo}"</div>
                {echo.author && (
                  <div className="pp-echo-author">— {echo.author}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
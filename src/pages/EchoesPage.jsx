import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { getPublicStream, getPublicEchoes } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { EMOTIONS, EMO_LIST } from "../services/emotions";
import ShareModal from "../components/ShareModal";
import "./EchoesPage.css";

function primaryEmotionOf(entry) {
  const first = entry.emotions?.[0];
  const id = typeof first === "string" ? first : first?.emotion_id;
  return { id, em: EMOTIONS[id] };
}

export default function EchoesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("community");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [shareConfig, setShareConfig] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const fetch = async () => {
      try {
        const data = tab === "mine" && user
          ? await getPublicEchoes(user.username)
          : await getPublicStream();
        if (alive) setEntries(data.echoes || []);
      } catch (err) {
        console.error("Failed to load echoes", err);
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetch();
    return () => { alive = false; };
  }, [tab, user]);

  const echoes = useMemo(() => {
    let r = entries.filter((e) => e.public_echo);
    if (filter) r = r.filter((e) => primaryEmotionOf(e).id === filter);
    return r;
  }, [entries, filter]);

  /* trending: emotion frequency across the stream */
  const trending = useMemo(() => {
    const counts = {};
    entries.forEach((e) => {
      const { id } = primaryEmotionOf(e);
      if (id) counts[id] = (counts[id] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [entries]);

  const presentEmotions = useMemo(() =>
    EMO_LIST.filter(([id]) => entries.some((e) => primaryEmotionOf(e).id === id)),
    [entries]
  );

  const onShare = (entry) => {
    if (tab !== "mine") return;
    setShareConfig({
      endpoint: `/public/echo/${entry.entry_id}/story`,
      filename: `echo-${(entry.title || "untitled").slice(0, 24).replace(/\s+/g, "-")}.png`,
    });
  };

  const [featured, ...rest] = echoes;
  const centerCol = rest.slice(0, 3);
  const rightCol = rest.slice(3, 5);

  return (
    <div className="echoes-page">
      <div className="ep-masthead">
        <div>
          <div className="label" style={{ marginBottom: 14 }}>· broadcast ·</div>
          <h1 className="ep-h1">The <em>Echoes</em>.</h1>
          <p className="ep-dek">
            One-line verdicts from readers across the catalog. Spoiler-free. Vibes only.
          </p>
        </div>
        <div className="ep-head-actions">
          <button className="btn ghost" onClick={() => navigate("/")} style={{ fontSize: 12 }}>← back to shelf</button>
          <div className="ep-tabs">
            {["community", "mine"].map((t) => (
              <button key={t} className={`ep-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t === "community" ? "the world" : "mine"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="rule-dbl" style={{ marginBottom: 24 }} />

      {/* filter chips */}
      {presentEmotions.length > 0 && (
        <div className="ep-filters">
          <div className="label" style={{ marginRight: 4 }}>filter by feeling</div>
          <button className={`chip ${!filter ? "active" : ""}`} style={{ "--chip-c": "var(--ink)" }} onClick={() => setFilter(null)}>
            <span className="swatch" /> all
          </button>
          {presentEmotions.map(([id, e]) => (
            <button
              key={id}
              className={`chip ${filter === id ? "active" : ""}`}
              style={{ "--chip-c": e.color }}
              onClick={() => setFilter(filter === id ? null : id)}
            >
              <span className="swatch" />{e.label.toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-screen" style={{ minHeight: 300 }}>
          <div className="loading-glyph">◈</div>
          <div className="loading-text">listening for echoes…</div>
        </div>
      ) : echoes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-glyph">✦</div>
          <div className="empty-title">No echoes yet</div>
          <div className="empty-sub">The silence is loud.</div>
        </div>
      ) : (
        <div className="ep-grid">
          {featured && (
            <EchoFeatured entry={featured} onShare={tab === "mine" ? onShare : null} />
          )}

          <div className="ep-col">
            {centerCol.map((e) => (
              <EchoCard key={e.entry_id || e.id} entry={e} onShare={tab === "mine" ? onShare : null} />
            ))}
          </div>

          <div className="ep-col">
            {trending.length > 0 && (
              <div className="card editorial">
                <div className="label" style={{ marginBottom: 14 }}>trending feeling · this week</div>
                {trending.map(([id, n], i) => {
                  const e = EMOTIONS[id];
                  if (!e) return null;
                  return (
                    <div key={id} className="ep-trend-row" style={{ borderBottom: i < trending.length - 1 ? "1px solid var(--rule-soft)" : "none" }}>
                      <span className="ep-trend-dot" style={{ background: e.color }} />
                      <span className="ep-trend-name">{e.label.toLowerCase()}</span>
                      <span className="ep-trend-count">{n} echo{n === 1 ? "" : "es"}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {rightCol.map((e) => (
              <EchoCardHand key={e.entry_id || e.id} entry={e} onShare={tab === "mine" ? onShare : null} />
            ))}
          </div>
        </div>
      )}

      <ShareModal
        isOpen={!!shareConfig}
        onClose={() => setShareConfig(null)}
        endpoint={shareConfig?.endpoint}
        filename={shareConfig?.filename}
      />
    </div>
  );
}

function EchoFeatured({ entry, onShare }) {
  const { em } = primaryEmotionOf(entry);
  const color = em?.color || "var(--brass)";
  return (
    <div className="card ep-featured" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${color} 14%, var(--bg-card)), var(--bg-card))`, borderTop: `3px solid ${color}` }}>
      <div className="label" style={{ marginBottom: 10, color }}>✦ echo of the day</div>
      <div className="ep-featured-quote">“{entry.public_echo}”</div>
      <div className="ep-featured-meta">
        <div>
          <div className="ep-meta-title">{entry.title}</div>
          <div className="label-sm">{entry.author}</div>
          {entry.username && (
            <div className="ep-meta-by">— @{entry.username}</div>
          )}
        </div>
        {onShare && (
          <button className="ep-share" onClick={() => onShare(entry)} title="Download image">
            <Download size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function EchoCard({ entry, onShare }) {
  const { em } = primaryEmotionOf(entry);
  const color = em?.color || "var(--ink)";
  return (
    <div className="card ep-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="ep-card-head">
        <div className="label-sm" style={{ color }}>◉ {em?.label.toLowerCase() || "echo"}</div>
        {entry.created_at && <div className="label-sm">{new Date(entry.created_at).toLocaleDateString()}</div>}
      </div>
      <div className="ep-card-quote">“{entry.public_echo}”</div>
      <div className="ep-card-foot">
        <div>
          <div className="ep-meta-title small">{entry.title}</div>
          <div className="label-sm">{entry.author}</div>
        </div>
        <div className="ep-card-by">@{entry.username || "anon"}</div>
        {onShare && (
          <button className="ep-share" onClick={() => onShare(entry)} title="Download image">
            <Download size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function EchoCardHand({ entry, onShare }) {
  const { em } = primaryEmotionOf(entry);
  const color = em?.color || "var(--ink)";
  return (
    <div className="card ep-card-hand" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="label-sm" style={{ color, marginBottom: 10 }}>◉ {em?.label.toLowerCase() || "echo"}</div>
      <div className="ep-hand-quote">“{entry.public_echo}”</div>
      <div className="ep-card-foot">
        <div className="ep-meta-title small">{entry.title}</div>
        <div className="label-sm">@{entry.username || "anon"}</div>
        {onShare && (
          <button className="ep-share" onClick={() => onShare(entry)} title="Download image">
            <Download size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

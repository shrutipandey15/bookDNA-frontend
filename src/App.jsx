import { useState, useEffect, useCallback } from "react";
import {
  isAuthed, clearTokens, getMe,
  getEntries, getDNAProfile, getHeatmap, getStats, generateDNA,
} from "./services/api";
import AuthPage from "./pages/AuthPage";
import BookCard from "./components/BookCard";
import EntryModal from "./components/EntryModal";
import DNACard from "./components/DNACard";
import { Heatmap, Echoes, Stats } from "./components/Panels";
import "./App.css";

export default function App() {
  const [authed, setAuthed] = useState(isAuthed());
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState("shelf");
  const [modal, setModal] = useState(null);
  const [dnaProfile, setDnaProfile] = useState(null);
  const [heatmap, setHeatmapData] = useState(null);
  const [stats, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, entriesData, profile, hm, st] = await Promise.all([
        getMe(),
        getEntries(),
        getDNAProfile(),
        getHeatmap(),
        getStats(),
      ]);
      if (userData) setUser(userData);
      if (entriesData) setEntries(entriesData.entries || []);
      if (profile) setDnaProfile(profile);
      if (hm) setHeatmapData(hm);
      if (st) setStatsData(st);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const refreshAnalytics = () => {
    getDNAProfile().then((d) => d && setDnaProfile(d));
    getHeatmap().then((d) => d && setHeatmapData(d));
    getStats().then((d) => d && setStatsData(d));
  };

  const handleSaveEntry = (saved) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setModal(null);
    setTimeout(refreshAnalytics, 300);
  };

  const handleDeleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setModal(null);
    setTimeout(refreshAnalytics, 300);
  };

  const handleGenerateDNA = async () => {
    setGenerating(true);
    try {
      const data = await generateDNA();
      setTab("dna");
      const profile = await getDNAProfile();
      if (profile) setDnaProfile(profile);
    } catch (err) {
      alert(err.message);
    }
    setGenerating(false);
  };

  const logout = () => {
    clearTokens();
    setAuthed(false);
    setUser(null);
    setEntries([]);
  };

  if (!authed) return <AuthPage onAuth={() => setAuthed(true)} />;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-glyph">◈</div>
        <div className="loading-text">Loading your library...</div>
      </div>
    );
  }

  const canGenerate = entries.length >= 3;
  const TABS = [
    { id: "shelf", label: "Shelf", count: entries.length },
    { id: "heatmap", label: "Heatmap" },
    { id: "echoes", label: "Echoes", count: entries.filter((e) => e.public_echo).length },
    { id: "stats", label: "Stats" },
    { id: "dna", label: "DNA" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div>
            <div className="logo">BOOK <span>DNA</span></div>
            <div className="subtitle">{user?.display_name || user?.username}'s reading journal</div>
          </div>
          <div className="header-right">
            {canGenerate && tab !== "dna" && (
              <button className="gen-btn" onClick={handleGenerateDNA} disabled={generating}>
                {generating ? "..." : "✦ Generate DNA"}
              </button>
            )}
            <button className="logout-btn" onClick={logout} title="Logout">↗</button>
          </div>
        </div>
        <nav className="nav">
          {TABS.map((t) => (
            <div
              key={t.id}
              className={`nav-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.count !== undefined && <span className="tab-count">{t.count}</span>}
            </div>
          ))}
        </nav>
      </header>

      <main className="main">
        {tab === "shelf" && (
          <div className="shelf-section">
            {!canGenerate && entries.length > 0 && (
              <div className="progress-wrap">
                <div className="progress-info">
                  <span>DNA Progress</span>
                  <span className="progress-count">{entries.length} / 3</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (entries.length / 3) * 100)}%` }} />
                </div>
              </div>
            )}
            {entries.length === 0 && (
              <div className="empty-state">
                <div className="empty-glyph">📚</div>
                <div className="empty-title">Your shelf is empty</div>
                <div className="empty-sub">Add your first book to start building your emotional fingerprint</div>
              </div>
            )}
            <div className="shelf-grid">
              {entries.map((entry, i) => (
                <BookCard key={entry.id} entry={entry} index={i} onClick={() => setModal(entry)} />
              ))}
            </div>
            <button className="add-btn" onClick={() => setModal("new")}>+ Add Book</button>
          </div>
        )}

        {tab === "heatmap" && <Heatmap data={heatmap} />}
        {tab === "echoes" && <Echoes entries={entries} />}
        {tab === "stats" && <Stats stats={stats} />}

        {tab === "dna" && (
          <div className="dna-section">
            {dnaProfile?.personality ? (
              <>
                <div className="dna-reveal-label">Your Reading Personality</div>
                <DNACard profile={dnaProfile} username={user?.username} />
                <div className="dna-actions">
                  <button className="dna-action-btn" style={{ "--ab": "#C4553A" }}>📸 Save Card</button>
                  <button className="dna-action-btn" style={{ "--ab": "#6B3A5D" }}>✦ Share DNA</button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-glyph">◈</div>
                <div className="empty-title">Not enough data yet</div>
                <div className="empty-sub">Log at least 3 books with emotions to generate your DNA card</div>
                <button className="back-btn" onClick={() => setTab("shelf")}>← Back to Shelf</button>
              </div>
            )}
          </div>
        )}
      </main>

      {modal && (
        <EntryModal
          entry={modal === "new" ? null : modal}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

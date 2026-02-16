import { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useJournal } from "./hooks/useJournal";
import { saveCardAsImage } from "./utils/cardUtils";
import { getSharedDNA } from "./services/api";
import AuthPage from "./pages/AuthPage";
import BookCard from "./components/BookCard";
import EntryModal from "./components/EntryModal";
import DNACard from "./components/DNACard";
import EchoesPage from "./pages/EchoesPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import { Heatmap, Stats } from "./components/Panels";
import ErrorBoundary from "./components/ErrorBoundary";
import { EMO_LIST } from "./services/emotions";
import { clearCache } from "./services/offline";
import "./App.css";

function SharedProfile() {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    setLoading(true);
    getSharedDNA(token)
      .then((data) => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="loading-screen"><div className="loading-glyph">◈</div><div className="loading-text">Deciphering Link...</div></div>;
  if (!profile || !profile.personality) {
    return (
      <div className="empty-state" style={{ height: "100vh" }}>
        <div className="empty-glyph">?</div>
        <div className="empty-title">Link Expired</div>
        <div className="empty-sub">This profile is no longer accessible.</div>
        <Link to="/" className="back-btn">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="app public-view">
      <header className="header">
        <div className="brand">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><div className="logo">BOOK <span>DNA</span></div></Link>
        </div>
        <div className="header-right">
          <Link to="/" className="gen-btn">{currentUser ? "My Dashboard" : "Get Your Own"}</Link>
        </div>
      </header>
      <main className="main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
         <div className="dna-reveal-label" style={{ marginTop: 0 }}>Reading Personality</div>
         {/* Read-Only Mode for Shared Profile */}
         <DNACard profile={profile} username={profile.username || "Reader"} allowShare={false} />
      </main>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { 
    entries, dnaProfile, heatmap, stats,
    loading, generating,
    addEntry, editEntry, removeEntry, generate 
  } = useJournal(true);

  const navigate = useNavigate();

  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "dna" ? "dna" : "shelf";
  });
  
  const [modal, setModal] = useState(null);
  const [filterEmotion, setFilterEmotion] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [toast, setToast] = useState(null);
  const dnaCardRef = useRef(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (filterEmotion) result = result.filter(e => e.emotions?.some(em => em.emotion_id === filterEmotion));
    if (sortBy === "intensity") result = [...result].sort((a, b) => (b.intensity || 0) - (a.intensity || 0));
    else if (sortBy === "title") result = [...result].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return result;
  }, [entries, filterEmotion, sortBy]);

  const handleSaveEntry = async (data, existingId) => {
    try {
      if (existingId && !String(existingId).startsWith("temp-")) await editEntry(existingId, data);
      else await addEntry(data);
      setModal(null);
    } catch (err) { showToast("Failed to save book"); }
  };

  const handleDeleteEntry = async (id) => {
    try { await removeEntry(id); setModal(null); } 
    catch (err) { showToast("Failed to delete book"); }
  };

  const handleGenerateDNA = async () => {
    try { await generate(); setTab("dna"); showToast("Your DNA has been revealed ✦", "success"); } 
    catch (err) { showToast(err.message || "Failed to generate DNA"); }
  };

  const handleSaveCard = async () => {
    try { await saveCardAsImage(dnaCardRef.current, user?.username); showToast("Card saved", "success"); } 
    catch { showToast("Couldn't save card — try a screenshot instead."); }
  };

  const handleLogout = () => { logout(); clearCache(); };

  if (loading) return <div className="loading-screen"><div className="loading-glyph">◈</div><div className="loading-text">Loading library...</div></div>;

  const canGenerate = entries.length >= 3;
  
  const TABS = [
    { id: "shelf", label: "Shelf", count: entries.length },
    { id: "heatmap", label: "Heatmap" },
    { id: "stats", label: "Stats" },
    { id: "dna", label: "DNA" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div><div className="logo">BOOK <span>DNA</span></div><div className="subtitle">{user?.display_name || user?.username}'s reading journal</div></div>
          <div className="header-right">
            {canGenerate && tab !== "dna" && (
              <button className="gen-btn" onClick={handleGenerateDNA} disabled={generating}>
                {generating ? "✦ Analyzing..." : "✦ Generate DNA"}
              </button>
            )}
            <button className="logout-btn" onClick={() => navigate("/settings")} title="Settings">⚙</button>
          </div>
        </div>
        <nav className="nav">
          {TABS.map(t => (
            <div key={t.id} className={`nav-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}{t.count !== undefined && <span className="tab-count">{t.count}</span>}
            </div>
          ))}
          <div className="nav-tab" onClick={() => navigate("/echoes")}>Echoes</div>
        </nav>
      </header>

      <main className="main">
        {tab === "shelf" && (
          <ErrorBoundary name="Shelf">
            <div className="shelf-section">
              <button className="add-btn" onClick={() => setModal("new")}>+ Add Book</button>
              {!canGenerate && entries.length > 0 && (
                <div className="progress-wrap">
                  <div className="progress-info"><span>DNA Progress</span><span className="progress-count">{entries.length} / 3</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, (entries.length / 3) * 100)}%` }} /></div>
                </div>
              )}
              {entries.length > 0 && (
                <div className="shelf-controls">
                  <div className="shelf-filters">
                    <button className={`sf-chip ${!filterEmotion ? "active" : ""}`} onClick={() => setFilterEmotion(null)}>All</button>
                    {EMO_LIST.map(([id, e]) => {
                      const count = entries.filter(en => en.emotions?.some(em => em.emotion_id === id)).length;
                      if (!count) return null;
                      return (
                        <button key={id} className={`sf-chip ${filterEmotion === id ? "active" : ""}`} style={{ "--fc": e.color }} onClick={() => setFilterEmotion(filterEmotion === id ? null : id)}>
                          {e.icon} {e.label} <span className="sf-count">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="shelf-sort">
                    <select className="ss-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="date">Newest</option>
                      <option value="intensity">Intensity</option>
                      <option value="title">A → Z</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="shelf-grid">
                {filteredEntries.map((entry, i) => <BookCard key={entry.id} entry={entry} index={i} onClick={() => setModal(entry)} />)}
              </div>
            </div>
          </ErrorBoundary>
        )}

        {tab === "heatmap" && <Heatmap data={heatmap} />}
        {tab === "stats" && <Stats stats={stats} />}

        {tab === "dna" && (
          <ErrorBoundary name="DNA">
            <div className="dna-section">
              {dnaProfile?.personality ? (
                <>
                  <div className="dna-reveal-label">Your Reading Personality</div>
                  <DNACard 
                    ref={dnaCardRef} 
                    profile={dnaProfile} 
                    username={user?.username} 
                    allowShare={true} 
                    onSave={handleSaveCard}
                  />
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-glyph">◈</div>
                  <div className="empty-title">Not enough data yet</div>
                  <button className="back-btn" onClick={() => setTab("shelf")}>← Back to Shelf</button>
                </div>
              )}
            </div>
          </ErrorBoundary>
        )}
      </main>

      {modal && <EntryModal entry={modal === "new" ? null : modal} onSave={handleSaveEntry} onDelete={handleDeleteEntry} onClose={() => setModal(null)} />}
      {toast && <div className={`toast toast-${toast.type}`} onClick={() => setToast(null)}>{toast.message}</div>}
    </div>
  );
}

export default function App() {
  const { authed, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loading-glyph">◈</div></div>;
  
  return (
    <Routes>
      <Route path="/s/:token" element={<SharedProfile />} />
      <Route path="/echoes" element={authed ? <EchoesPage /> : <AuthPage />} />
      <Route path="/settings" element={authed ? <SettingsPage /> : <AuthPage />} />
      <Route path="/admin" element={authed ? <AdminPage /> : <AuthPage />} />
      <Route path="/" element={authed ? <Dashboard /> : <AuthPage />} />
    </Routes>
  );
}
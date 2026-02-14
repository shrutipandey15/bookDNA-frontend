import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Routes, Route, useParams, Link } from "react-router-dom";
import {
  getEntries, getDNAProfile, getHeatmap, getStats, generateDNA,
  createEntry, updateEntry, deleteEntry,
  getSharedDNA, generateShareToken
} from "./services/api";
import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import BookCard from "./components/BookCard";
import EntryModal from "./components/EntryModal";
import DNACard from "./components/DNACard";
import { Heatmap, Echoes, Stats } from "./components/Panels";
import ErrorBoundary from "./components/ErrorBoundary";
import { EMOTIONS, EMO_LIST } from "./services/emotions";
import { getCachedEntries, setCachedEntries, clearCache } from "./services/offline";
import "./App.css";

function TabLoader({ label }) {
  return (
    <div className="tab-loader">
      <div className="tab-loader-spinner">◈</div>
      <div className="tab-loader-text">{label || "Loading..."}</div>
    </div>
  );
}

function SharedProfile() {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    setLoading(true);
    getSharedDNA(token)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-glyph">◈</div>
        <div className="loading-text">Deciphering Link...</div>
      </div>
    );
  }

  if (!profile || !profile.personality) {
    return (
      <div className="empty-state" style={{ height: "100vh" }}>
        <div className="empty-glyph">?</div>
        <div className="empty-title">Link Expired or Invalid</div>
        <div className="empty-sub">This DNA profile is no longer accessible.</div>
        <Link to="/" className="back-btn">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="app public-view">
      <header className="header">
        <div className="brand">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo">BOOK <span>DNA</span></div>
          </Link>
        </div>
        <div className="header-right">
          <Link to="/" className="gen-btn">
             {currentUser ? "My Dashboard" : "Get Your Own"}
          </Link>
        </div>
      </header>
      
      <main className="main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
         <div className="dna-reveal-label" style={{ marginTop: 0 }}>Reading Personality</div>
         <DNACard profile={profile} username={profile.username || "Reader"} />
      </main>
    </div>
  );
}

function Dashboard() {
  const { authed, user, loading: authLoading, logout } = useAuth();
  const [entries, setEntries] = useState([]);
  
  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "dna" ? "dna" : "shelf";
  });
  
  const [modal, setModal] = useState(null);
  const [dnaProfile, setDnaProfile] = useState(null);
  const [heatmap, setHeatmapData] = useState(null);
  const [stats, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterEmotion, setFilterEmotion] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [shareToken, setShareToken] = useState(null);
  
  const dnaCardRef = useRef(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    const cached = getCachedEntries();
    if (cached) {
      setEntries(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const [entriesData, profile, hm, st] = await Promise.all([
        getEntries(),
        getDNAProfile(),
        getHeatmap(),
        getStats(),
      ]);
      if (entriesData) {
        setEntries(entriesData.entries || []);
        setCachedEntries(entriesData.entries || []);
      }
      if (profile) {
        setDnaProfile(profile);
        if (profile.share_token) setShareToken(profile.share_token);
      }
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

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (filterEmotion) {
      result = result.filter((e) =>
        e.emotions?.some((em) => em.emotion_id === filterEmotion)
      );
    }
    if (sortBy === "intensity") {
      result = [...result].sort((a, b) => (b.intensity || 0) - (a.intensity || 0));
    } else if (sortBy === "title") {
      result = [...result].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }
    return result;
  }, [entries, filterEmotion, sortBy]);

  const refreshAnalytics = async () => {
    setRefreshing(true);
    try {
      const [profile, hm, st] = await Promise.all([
        getDNAProfile(),
        getHeatmap(),
        getStats(),
      ]);
      if (profile) setDnaProfile(profile);
      if (hm) setHeatmapData(hm);
      if (st) setStatsData(st);
    } catch (err) {
      console.error("Failed to refresh analytics:", err);
    }
    setRefreshing(false);
  };

  const handleSaveEntry = (data, existingId) => {
    const prevEntries = [...entries];
    const isUpdate = existingId && !String(existingId).startsWith("temp-");

    if (isUpdate) {
      setEntries((prev) => {
        const existing = prev.find((e) => e.id === existingId);
        const optimistic = { ...existing, ...data };
        const next = prev.map((e) => (e.id === existingId ? optimistic : e));
        setCachedEntries(next);
        return next;
      });
      setModal(null);

      updateEntry(existingId, data)
        .then((saved) => {
          setEntries((prev) => {
            const next = prev.map((e) => (e.id === existingId ? saved : e));
            setCachedEntries(next);
            return next;
          });
          setTimeout(refreshAnalytics, 300);
        })
        .catch((err) => {
          setEntries(prevEntries);
          setCachedEntries(prevEntries);
          showToast("Failed to update — your changes were reverted.");
        });
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        ...data,
        id: tempId,
        emotions: data.emotions.map((e) => ({ emotion_id: e.emotion_id, strength: e.strength })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setEntries((prev) => {
        const next = [optimistic, ...prev];
        setCachedEntries(next);
        return next;
      });
      setModal(null);

      createEntry(data)
        .then((saved) => {
          setEntries((prev) => {
            const hasTemp = prev.some((e) => e.id === tempId);
            const hasReal = prev.some((e) => e.id === saved.id);
            let next;
            if (hasTemp) {
              next = prev.map((e) => (e.id === tempId ? saved : e));
            } else if (!hasReal) {
              next = [saved, ...prev];
            } else {
              next = prev;
            }
            setCachedEntries(next);
            return next;
          });
          setTimeout(refreshAnalytics, 300);
        })
        .catch((err) => {
          setEntries(prevEntries);
          setCachedEntries(prevEntries);
          showToast("Failed to add book — please try again.");
        });
    }
  };

  const handleDeleteEntry = (id) => {
    const prevEntries = [...entries];
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      setCachedEntries(next);
      return next;
    });
    setModal(null);

    if (String(id).startsWith("temp-")) return;

    deleteEntry(id)
      .then(() => setTimeout(refreshAnalytics, 300))
      .catch((err) => {
        if (err.status === 404) return;
        setEntries(prevEntries);
        setCachedEntries(prevEntries);
        showToast("Failed to delete — the entry has been restored.");
      });
  };

  const handleGenerateDNA = async () => {
    setGenerating(true);
    try {
      await generateDNA();
      setTab("dna");
      const profile = await getDNAProfile();
      if (profile) setDnaProfile(profile);
      showToast("Your DNA has been revealed ✦", "success");
    } catch (err) {
      showToast(err.message || "Failed to generate DNA.");
    }
    setGenerating(false);
  };

  const handleShareDNA = async () => {
    let tokenToShare = shareToken;
    const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;

    if (!tokenToShare) {
      try {
        setGenerating(true);
        const data = await generateShareToken();
        tokenToShare = data.share_token;
        setShareToken(data.share_token);
        setGenerating(false);
      } catch (err) {
        setGenerating(false);
        showToast("Failed to generate link");
        return;
      }
    }

    const shareUrl = `${baseUrl}/s/${tokenToShare}`;

    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({ url: shareUrl });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Secure link copied to clipboard", "success");
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      showToast("Link copied to clipboard", "success");
    }
  };

  const handleSaveCard = async () => {
    if (!dnaCardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const original = dnaCardRef.current;
      const clone = original.cloneNode(true);
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      document.body.appendChild(clone);

      const sanitizeColor = (val) => {
        if (!val || typeof val !== "string") return val;
        return val.replace(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\)/g,
          (_, r, g, b, a) => {
            const ri = Math.round(parseFloat(r) * 255);
            const gi = Math.round(parseFloat(g) * 255);
            const bi = Math.round(parseFloat(b) * 255);
            const ai = a !== undefined ? parseFloat(a) : 1;
            return `rgba(${ri}, ${gi}, ${bi}, ${ai})`;
          }
        );
      };

      const resolveStyles = (src, dst) => {
        const computed = window.getComputedStyle(src);
        dst.style.cssText = "";
        for (const prop of computed) {
          let val = computed.getPropertyValue(prop);
          val = sanitizeColor(val);
          try { dst.style.setProperty(prop, val); } catch {}
        }
        for (let i = 0; i < src.children.length; i++) {
          if (dst.children[i]) resolveStyles(src.children[i], dst.children[i]);
        }
      };
      resolveStyles(original, clone);
      clone.style.animation = "none";
      clone.querySelectorAll("*").forEach((el) => { el.style.animation = "none"; });

      const canvas = await html2canvas(clone, {
        backgroundColor: "#0c0c10",
        scale: 3,
        useCORS: true,
        logging: false,
      });
      document.body.removeChild(clone);

      const link = document.createElement("a");
      link.download = `bookdna-${user?.username || "card"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Card saved", "success");
    } catch (err) {
      console.error("Save card failed:", err);
      showToast("Couldn't save card — try a screenshot instead.");
    }
  };

  const handleLogout = () => {
    logout();
    clearCache();
    setEntries([]);
    setDnaProfile(null);
    setHeatmapData(null);
    setStatsData(null);
  };

  if (authLoading) return <div className="loading-screen"><div className="loading-glyph">◈</div></div>;
  if (!authed) return <AuthPage />;
  if (loading) return <div className="loading-screen"><div className="loading-glyph">◈</div><div className="loading-text">Loading library...</div></div>;

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
                {generating ? "✦ Analyzing..." : "✦ Generate DNA"}
              </button>
            )}
            <button className="logout-btn" onClick={handleLogout} title="Logout">↗</button>
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
          <ErrorBoundary name="Shelf">
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

              {entries.length > 0 && (
                <div className="shelf-controls">
                  <div className="shelf-filters">
                    <button
                      className={`sf-chip ${!filterEmotion ? "active" : ""}`}
                      onClick={() => setFilterEmotion(null)}
                    >All</button>
                    {EMO_LIST.map(([id, e]) => {
                      const count = entries.filter((en) =>
                        en.emotions?.some((em) => em.emotion_id === id)
                      ).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={id}
                          className={`sf-chip ${filterEmotion === id ? "active" : ""}`}
                          style={{ "--fc": e.color }}
                          onClick={() => setFilterEmotion(filterEmotion === id ? null : id)}
                        >
                          {e.icon} {e.label}
                          <span className="sf-count">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="shelf-sort">
                    <select
                      className="ss-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="date">Newest</option>
                      <option value="intensity">Intensity</option>
                      <option value="title">A → Z</option>
                    </select>
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
              {entries.length > 0 && filteredEntries.length === 0 && (
                <div className="empty-state">
                  <div className="empty-glyph">{EMOTIONS[filterEmotion]?.icon || "🔍"}</div>
                  <div className="empty-title">No books with this emotion</div>
                  <div className="empty-sub">
                    <button className="clear-filter-btn" onClick={() => setFilterEmotion(null)}>Clear filter</button>
                  </div>
                </div>
              )}
              <div className="shelf-grid">
                {filteredEntries.map((entry, i) => (
                  <BookCard key={entry.id} entry={entry} index={i} onClick={() => setModal(entry)} />
                ))}
              </div>
              <button className="add-btn" onClick={() => setModal("new")}>+ Add Book</button>
            </div>
          </ErrorBoundary>
        )}

        {tab === "heatmap" && <ErrorBoundary name="Heatmap">{refreshing ? <TabLoader label="Updating heatmap..." /> : <Heatmap data={heatmap} />}</ErrorBoundary>}
        {tab === "echoes" && <ErrorBoundary name="Echoes"><Echoes entries={entries} /></ErrorBoundary>}
        {tab === "stats" && <ErrorBoundary name="Stats">{refreshing ? <TabLoader label="Crunching numbers..." /> : <Stats stats={stats} />}</ErrorBoundary>}

        {tab === "dna" && (
          <ErrorBoundary name="DNA">
            <div className="dna-section">
              {dnaProfile?.personality ? (
                <>
                  <div className="dna-reveal-label">Your Reading Personality</div>
                  <DNACard ref={dnaCardRef} profile={dnaProfile} username={user?.username} />
                  <div className="dna-actions">
                    <button className="dna-action-btn" style={{ "--ab": "#C4553A" }} onClick={handleSaveCard}>📸 Save Card</button>
                    {/* Share Button updated to use secure token */}
                    <button className="dna-action-btn" style={{ "--ab": "#6B3A5D" }} onClick={handleShareDNA}>✦ Share Secure Link</button>
                  </div>
                  {shareToken && (
                     <div style={{textAlign:'center', marginTop:'10px', opacity: 0.5, fontSize: '0.8rem'}}>
                        Link active: .../s/{shareToken.slice(0,6)}...
                     </div>
                  )}
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
          </ErrorBoundary>
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

      {toast && (
        <div className={`toast toast-${toast.type}`} onClick={() => setToast(null)}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/s/:token" element={<SharedProfile />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}
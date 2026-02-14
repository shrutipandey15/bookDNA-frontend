import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getEntries, getDNAProfile, getHeatmap, getStats, generateDNA,
  createEntry, updateEntry, deleteEntry,
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

export default function App() {
  const { authed, user, loading: authLoading, logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState("shelf");
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

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    // Serve cached entries instantly
    const cached = getCachedEntries();
    if (cached) {
      setEntries(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // Fetch fresh data from server
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
    // Temp IDs aren't real server entries — treat as new
    const isUpdate = existingId && !String(existingId).startsWith("temp-");

    if (isUpdate) {
      const optimistic = { ...entries.find((e) => e.id === existingId), ...data };
      setEntries((prev) => {
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
          console.error("Update failed, rolling back:", err);
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
            // Replace temp entry, or if loadData already ran and temp is gone,
            // add saved only if not already present (dedup by server ID)
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
          console.error("Create failed, rolling back:", err);
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

    // Temp entries (from optimistic add) don't exist on server — just remove locally
    if (String(id).startsWith("temp-")) return;

    deleteEntry(id)
      .then(() => {
        setTimeout(refreshAnalytics, 300);
      })
      .catch((err) => {
        // 404 means already gone from server — that's fine, keep it deleted locally
        if (err.status === 404) {
          console.log("Entry already deleted on server, keeping local state.");
          return;
        }
        console.error("Delete failed, rolling back:", err);
        setEntries(prevEntries);
        setCachedEntries(prevEntries);
        showToast("Failed to delete — the entry has been restored.");
      });
  };

  const handleGenerateDNA = async () => {
    setGenerating(true);
    try {
      const data = await generateDNA();
      setTab("dna");
      const profile = await getDNAProfile();
      if (profile) setDnaProfile(profile);
      showToast("Your DNA has been revealed ✦", "success");
    } catch (err) {
      showToast(err.message || "Failed to generate DNA.");
    }
    setGenerating(false);
  };

  const handleLogout = () => {
    logout();
    clearCache();
    setEntries([]);
    setDnaProfile(null);
    setHeatmapData(null);
    setStatsData(null);
  };

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-glyph">◈</div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!authed) return <AuthPage />;

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
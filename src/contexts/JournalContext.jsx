import { useState, useCallback, useEffect, useContext, createContext } from "react";
import {
  getAllEntries, getDNAProfile, getPatterns, generateDNA,
  createEntry, updateEntry, deleteEntry, generateShareToken, finishEntry
} from "../services/api";
import { getCachedEntries, setCachedEntries } from "../services/offline";

const JournalContext = createContext(null);

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error("useJournal must be used inside JournalProvider");
  return ctx;
}

export function JournalProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [analytics, setAnalytics] = useState({ profile: null, heatmap: null, stats: null });
  const [stale, setStale] = useState({ heatmap: true, stats: true, profile: true });
  const [shareToken, setShareToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  // Distinguishes a genuine failure (429/500/offline) from an empty shelf so the
  // UI can show an honest error instead of "no books yet". null = no error. [F1.2]
  const [entriesError, setEntriesError] = useState(null);

  // Fetches entries + profile. Called on mount and on visibility restore.
  const loadEntries = useCallback(async () => {
    const cached = getCachedEntries();
    if (cached) {
      setEntries(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const eData = await getAllEntries();
      setEntries(eData.entries || []);
      setCachedEntries(eData.entries || []);
      setEntriesError(null);
    } catch (err) {
      // Only surface the error when we have nothing to show. If cached entries
      // are on screen, keep them and stay silent rather than clobbering the shelf.
      console.error("Entries load failed:", err);
      if (!cached) setEntriesError(err.kind ? err : { kind: "server", status: err.status });
    }

    // Profile is secondary; its absence is an honest "not enough yet", not an error.
    try {
      const prof = await getDNAProfile();
      if (prof) {
        setAnalytics(prev => ({ ...prev, profile: prof }));
        if (prof.share_token) setShareToken(prof.share_token);
        setStale(prev => ({ ...prev, profile: false }));
      }
    } catch (err) {
      console.error("Profile load failed:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Multi-tab freshness: if tab was hidden >30s, refetch entries and mark analytics stale.
  useEffect(() => {
    let lastHidden = null;

    const handleVisibility = () => {
      if (document.hidden) {
        lastHidden = Date.now();
      } else if (lastHidden && Date.now() - lastHidden > 30_000) {
        loadEntries();
        setStale({ heatmap: true, stats: true, profile: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadEntries]);

  // Fetch a specific analytics key only if stale or missing. No-op if already fresh.
  const ensureFresh = useCallback(async (key) => {
    if (key === "patterns") {
      // One round trip for the merged Patterns view (stats + heatmap). [F5.2]
      if (!stale.stats && !stale.heatmap && analytics.stats !== null && analytics.heatmap !== null) return;
      try {
        const data = await getPatterns();
        if (data) setAnalytics(prev => ({ ...prev, stats: data.stats, heatmap: data.heatmap }));
        setStale(prev => ({ ...prev, stats: false, heatmap: false }));
      } catch (err) {
        console.error("Patterns fetch failed:", err);
        setStale(prev => ({ ...prev, stats: false, heatmap: false }));
      }
    } else if (key === "profile") {
      if (!stale.profile && analytics.profile !== null) return analytics.profile;
      try {
        const prof = await getDNAProfile();
        if (prof) {
          setAnalytics(prev => ({ ...prev, profile: prof }));
          if (prof.share_token) setShareToken(prof.share_token);
        }
        setStale(prev => ({ ...prev, profile: false }));
        return prof;
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setStale(prev => ({ ...prev, profile: false }));
      }
    }
  }, [stale, analytics]);

  const addEntry = async (data) => {
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      ...data, id: tempId, emotions: data.emotions.map(e => ({ ...e })),
      created_at: new Date().toISOString()
    };
    setEntries(prev => { const next = [optimistic, ...prev]; setCachedEntries(next); return next; });
    try {
      const saved = await createEntry(data);
      setEntries(prev => { const next = prev.map(e => e.id === tempId ? saved : e); setCachedEntries(next); return next; });
      setStale({ heatmap: true, stats: true, profile: true });
      return true;
    } catch (err) {
      setEntries(prev => prev.filter(e => e.id !== tempId));
      throw err;
    }
  };

  const editEntry = async (id, data) => {
    const prevEntries = [...entries];
    setEntries(prev => { const next = prev.map(e => e.id === id ? { ...e, ...data } : e); setCachedEntries(next); return next; });
    try {
      const saved = await updateEntry(id, data);
      setEntries(prev => { const next = prev.map(e => e.id === id ? saved : e); setCachedEntries(next); return next; });
      setStale({ heatmap: true, stats: true, profile: true });
      return true;
    } catch (err) {
      setEntries(prevEntries);
      throw err;
    }
  };

  // Finish Flow: record the three-beat arc, then replace the entry with the
  // server's version (arc emotions, finish_thought, status=finished). [F2.2]
  const finishBook = async (id, data) => {
    const saved = await finishEntry(id, data);
    setEntries(prev => { const next = prev.map(e => e.id === id ? saved : e); setCachedEntries(next); return next; });
    setStale({ heatmap: true, stats: true, profile: true });
    return saved;
  };

  const removeEntry = async (id) => {
    const prevEntries = [...entries];
    setEntries(prev => { const next = prev.filter(e => e.id !== id); setCachedEntries(next); return next; });
    if (String(id).startsWith("temp-")) return;
    try {
      await deleteEntry(id);
      setStale({ heatmap: true, stats: true, profile: true });
    } catch (err) {
      if (err.status !== 404) { setEntries(prevEntries); throw err; }
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const result = await generateDNA();
      const profile = await getDNAProfile();
      setAnalytics(prev => ({ ...prev, profile }));
      setStale(prev => ({ ...prev, profile: false, heatmap: true, stats: true }));
      setGenerating(false);
      return true;
    } catch (err) {
      setGenerating(false);
      throw err;
    }
  };

  const createToken = async () => {
    try {
      setGenerating(true);
      const data = await generateShareToken();
      setShareToken(data.share_token);
      setGenerating(false);
      return data.share_token;
    } catch (err) {
      setGenerating(false);
      throw err;
    }
  };

  return (
    <JournalContext.Provider value={{
      entries, analytics, stale, shareToken,
      loading, generating, entriesError,
      addEntry, editEntry, removeEntry, finishBook, generate, createToken,
      ensureFresh, loadEntries,
    }}>
      {children}
    </JournalContext.Provider>
  );
}

import { useState, useCallback, useEffect } from "react";
import { 
  getEntries, getDNAProfile, getHeatmap, getStats, generateDNA, 
  createEntry, updateEntry, deleteEntry, generateShareToken
} from "../services/api";
import { getCachedEntries, setCachedEntries } from "../services/offline";

export function useJournal(authed) {
  const [entries, setEntries] = useState([]);
  const [dnaProfile, setDnaProfile] = useState(null);
  const [heatmap, setHeatmapData] = useState(null);
  const [stats, setStatsData] = useState(null);
  const [shareToken, setShareToken] = useState(null); // ✅ Added
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const cached = getCachedEntries();
    if (cached) {
      setEntries(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const [eData, prof, hm, st] = await Promise.all([
        getEntries(), getDNAProfile(), getHeatmap(), getStats()
      ]);
      
      if (eData?.entries) {
        setEntries(eData.entries);
        setCachedEntries(eData.entries);
      }
      if (prof) {
        setDnaProfile(prof);
        if (prof.share_token) setShareToken(prof.share_token); // ✅ Capture token
      }
      if (hm) setHeatmapData(hm);
      if (st) setStatsData(st);
    } catch (err) {
      console.error("Data load failed:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  // ... (CRUD operations same as before: addEntry, editEntry, removeEntry) ...
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
      setTimeout(refreshAnalytics, 300);
      return true;
    } catch (err) {
      setEntries(prev => prev.filter(e => e.id !== tempId)); throw err;
    }
  };

  const editEntry = async (id, data) => {
    const prevEntries = [...entries];
    setEntries(prev => { const next = prev.map(e => e.id === id ? { ...e, ...data } : e); setCachedEntries(next); return next; });
    try {
      const saved = await updateEntry(id, data);
      setEntries(prev => { const next = prev.map(e => e.id === id ? saved : e); setCachedEntries(next); return next; });
      setTimeout(refreshAnalytics, 300);
      return true;
    } catch (err) { setEntries(prevEntries); throw err; }
  };

  const removeEntry = async (id) => {
    const prevEntries = [...entries];
    setEntries(prev => { const next = prev.filter(e => e.id !== id); setCachedEntries(next); return next; });
    if (String(id).startsWith("temp-")) return;
    try { await deleteEntry(id); setTimeout(refreshAnalytics, 300); } 
    catch (err) { if (err.status !== 404) { setEntries(prevEntries); throw err; } }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    try {
      const [prof, hm, st] = await Promise.all([getDNAProfile(), getHeatmap(), getStats()]);
      if (prof) setDnaProfile(prof);
      if (hm) setHeatmapData(hm);
      if (st) setStatsData(st);
    } catch (err) { console.error("Refresh failed", err); }
    setRefreshing(false);
  };

  const generate = async () => {
    setGenerating(true);
    try {
      await generateDNA();
      const profile = await getDNAProfile();
      if (profile) setDnaProfile(profile);
      setGenerating(false);
      return true;
    } catch (err) { setGenerating(false); throw err; }
  };

  // ✅ New helper to create token
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

  return {
    entries, dnaProfile, heatmap, stats, shareToken, // ✅ Export token
    loading, generating, refreshing,
    addEntry, editEntry, removeEntry, generate, createToken, // ✅ Export creator
    setEntries 
  };
}
import { useState, useCallback, useRef } from "react";
import { getRoom, saveRoomLayout } from "../../../services/api";

export function useRoomData() {
  const [layout, setLayout] = useState(null);
  const [unlocks, setUnlocks] = useState([]);
  const [decorations, setDecorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUnlocks, setNewUnlocks] = useState([]);
  const [saveError, setSaveError] = useState(false);
  const saveTimer = useRef(null);
  const lastSaved = useRef(null);
  const initialized = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRoom();
      setLayout(data.layout);
      setUnlocks(data.unlocks || []);
      setDecorations(data.decorations || []);
      initialized.current = true;
    } catch (err) {
      console.error("Failed to load room:", err);
    }
    setLoading(false);
  }, []);

  const save = useCallback((shelves) => {
    lastSaved.current = layout;
    const newLayout = { shelves };
    setLayout(newLayout);
    setSaveError(false);

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveRoomLayout(shelves);
      } catch (err) {
        console.error("Failed to save room:", err);
        setSaveError(true);
        if (lastSaved.current) setLayout(lastSaved.current);
      }
    }, 500);
  }, [layout]);

  const handleNewUnlocks = useCallback((newItems) => {
    if (!newItems?.length) return;
    setNewUnlocks(newItems);
    setUnlocks(prev => [...new Set([...prev, ...newItems])]);
  }, []);

  const dismissUnlock = useCallback(() => setNewUnlocks([]), []);

  return {
    layout, unlocks, decorations, loading, newUnlocks, saveError,
    isInitialized: initialized.current,
    load, save, handleNewUnlocks, dismissUnlock,
  };
}
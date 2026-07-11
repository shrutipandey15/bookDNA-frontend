import { useState, useEffect } from "react";
import { EMO_LIST, EMOTIONS } from "../services/emotions";
import { getCheckins, createCheckin } from "../services/api";
import "./CheckinPanel.css";

/**
 * Currently-reading check-ins — "how's it feeling now?" [F2.3 / B2.3]
 *
 * The beat that makes the app a daily companion: while you're mid-book you can
 * log the emotional weather without finishing. Shows the running timeline and a
 * compact add form. Rendered inside the accessible <Modal>.
 */

const MAX_NOTE = 80;

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export default function CheckinPanel({ entry, onClose }) {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emotion, setEmotion] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getCheckins(entry.id)
      .then((list) => { if (alive) setCheckins(list); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [entry.id]);

  const submit = async () => {
    if (!emotion || saving) return;
    setError("");
    setSaving(true);
    try {
      const saved = await createCheckin(entry.id, { emotion_slug: emotion, note: note.trim() || null });
      setCheckins((prev) => [saved, ...prev]);
      setEmotion(null);
      setNote("");
    } catch (err) {
      setError(err.message || "Couldn't save check-in.");
    }
    setSaving(false);
  };

  return (
    <div className="ci">
      <div className="ci-head">
        <div className="label">still reading</div>
        <h2 className="ci-title">{entry?.title || "This book"}</h2>
        <p className="ci-sub">How is it feeling right now?</p>
      </div>

      <div className="ci-form">
        <div className="ci-emo-grid" role="radiogroup" aria-label="How does it feel right now?">
          {EMO_LIST.map(([id, e]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={emotion === id}
              className={`ci-emo ${emotion === id ? "active" : ""}`}
              style={{ "--emo-c": e.color }}
              onClick={() => setEmotion(id)}
            >
              <span className="ci-emo-swatch" />
              {e.label.toLowerCase()}
            </button>
          ))}
        </div>
        <input
          className="ci-note"
          placeholder="A few words (optional)…"
          value={note}
          maxLength={MAX_NOTE}
          onChange={(e) => setNote(e.target.value)}
        />
        {error && <div className="ci-error" role="alert" aria-live="assertive">{error}</div>}
        <button className="btn brass" onClick={submit} disabled={!emotion || saving}>
          {saving ? "saving…" : "log this moment"}
        </button>
      </div>

      <div className="ci-timeline">
        <div className="label-sm ci-timeline-label">the story so far</div>
        {loading ? (
          <div className="ci-empty">loading…</div>
        ) : checkins.length === 0 ? (
          <div className="ci-empty">No check-ins yet — this is the first.</div>
        ) : (
          <ul className="ci-list">
            {checkins.map((c) => {
              const emo = EMOTIONS[c.emotion_slug] || { label: c.emotion_slug, color: "var(--ink-quiet)" };
              return (
                <li key={c.id} className="ci-item">
                  <span className="ci-item-dot" style={{ background: emo.color }} />
                  <div className="ci-item-body">
                    <div className="ci-item-emo" style={{ color: emo.color }}>{emo.label?.toLowerCase()}</div>
                    {c.note && <div className="ci-item-note">“{c.note}”</div>}
                  </div>
                  <span className="ci-item-time">{timeAgo(c.created_at)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="ci-footer">
        <button className="btn ghost" onClick={onClose}>done</button>
      </div>
    </div>
  );
}

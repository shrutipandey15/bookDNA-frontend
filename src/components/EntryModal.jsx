import { useState } from "react";
import { EMO_LIST } from "../services/emotions";
import { createEntry, updateEntry, deleteEntry } from "../services/api";
import "./EntryModal.css";

export default function EntryModal({ entry, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(entry?.title || "");
  const [author, setAuthor] = useState(entry?.author || "");
  const [intensity, setIntensity] = useState(entry?.intensity || 5);
  const [emotions, setEmotions] = useState(
    entry?.emotions?.map((e) => e.emotion_id) || []
  );
  const [quote, setQuote] = useState(entry?.quote || "");
  const [publicEcho, setPublicEcho] = useState(entry?.public_echo || "");
  const [saving, setSaving] = useState(false);

  const toggleEmo = (id) => {
    setEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const data = {
      title: title.trim(),
      author: author.trim() || null,
      intensity,
      emotions: emotions.map((id) => ({ emotion_id: id, strength: intensity })),
      quote: quote.trim() || null,
      public_echo: publicEcho.trim() || null,
    };
    try {
      let saved;
      if (entry?.id) {
        saved = await updateEntry(entry.id, data);
      } else {
        saved = await createEntry(data);
      }
      onSave(saved);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!entry?.id) return;
    await deleteEntry(entry.id);
    onDelete(entry.id);
  };

  const intLabels = [
    "", "barely", "barely", "lingered", "lingered",
    "felt it", "felt it", "obsessed", "obsessed", "wrecked", "wrecked",
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-text">
            {entry?.id ? "Edit Entry" : "Add Book"}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <input
          className="m-input m-input-title"
          placeholder="Book title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="m-input"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <div className="m-label">What did it make you feel?</div>
        <div className="m-emo-grid">
          {EMO_LIST.map(([id, e]) => (
            <div
              key={id}
              className={`m-emo-tag ${emotions.includes(id) ? "active" : ""}`}
              style={{ "--tc": e.color }}
              onClick={() => toggleEmo(id)}
            >
              <span>{e.icon}</span>
              <span>{e.label}</span>
            </div>
          ))}
        </div>

        <div className="m-label">Emotional intensity</div>
        <div className="m-slider-row">
          <span className="m-slider-val">{intensity}</span>
          <input
            type="range" min="1" max="10"
            value={intensity}
            onChange={(e) => setIntensity(+e.target.value)}
            className="m-slider"
          />
          <span className="m-slider-label">{intLabels[intensity]}</span>
        </div>

        <div className="m-label">The line that hit hardest</div>
        <textarea
          className="m-input m-textarea"
          placeholder="Optional — the quote you can't forget..."
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows={2}
        />

        <div className="m-echo-section">
          <div className="m-echo-label">✦ Public Echo</div>
          <textarea
            className="m-input m-echo-input"
            placeholder="Spoiler-free vibe for the world..."
            value={publicEcho}
            onChange={(e) => setPublicEcho(e.target.value)}
            rows={2}
          />
          <div className="m-echo-hint">
            Vibes only. No spoilers. This is what people see.
          </div>
        </div>

        <div className="modal-actions">
          {entry?.id && (
            <button className="m-btn m-btn-danger" onClick={handleDelete}>
              Delete
            </button>
          )}
          <button
            className="m-btn m-btn-primary"
            onClick={handleSave}
            disabled={saving || !title.trim()}
          >
            {saving ? "Saving..." : entry?.id ? "Update" : "Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
}

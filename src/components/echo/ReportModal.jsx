import { useState } from "react";
import "./ReportModal.css";

/**
 * Report a piece of content. [F3.5 / B3.7]
 *
 * One-tap, categorized, NO free-text required. The target (echo or reply) and the
 * submit handler are supplied by the caller; this just collects a category.
 */
const CATEGORIES = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate",       label: "Hate speech" },
  { value: "self_harm",  label: "Self-harm" },
  { value: "spam",       label: "Spam" },
  { value: "pii",        label: "Private information" },
  { value: "csam",       label: "Child sexual abuse material" },
  { value: "other",      label: "Something else" },
];

export default function ReportModal({ onSubmit, onClose }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const pick = async (category) => {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await onSubmit(category);
      setDone(true);
    } catch (err) {
      setError(err.message || "Couldn't submit the report.");
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rep" role="status" aria-live="polite">
        <div className="rep-glyph" aria-hidden="true">✓</div>
        <h2 className="rep-title">Thank you.</h2>
        <p className="rep-sub">A moderator will take a look. You won't see this content flagged publicly — reports are private.</p>
        <div className="rep-footer"><button className="btn brass" onClick={onClose}>done</button></div>
      </div>
    );
  }

  return (
    <div className="rep">
      <div className="label">report</div>
      <h2 className="rep-title">What's wrong here?</h2>
      <p className="rep-sub">Pick the closest reason. No need to write anything.</p>
      <div className="rep-cats">
        {CATEGORIES.map((c) => (
          <button key={c.value} className="rep-cat" disabled={busy} onClick={() => pick(c.value)}>
            {c.label}
          </button>
        ))}
      </div>
      {error && <div className="rep-error" role="alert" aria-live="assertive">{error}</div>}
      <div className="rep-footer"><button className="btn ghost" onClick={onClose} disabled={busy}>cancel</button></div>
    </div>
  );
}

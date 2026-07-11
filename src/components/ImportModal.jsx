import { useState, useRef } from "react";
import { importLibrary } from "../services/api";
import "./ImportModal.css";

/**
 * Import a Goodreads / StoryGraph CSV export. [F2.6 / B2.7]
 *
 * The cold-start path so a new reader isn't staring at an empty shelf. Picks a
 * .csv, uploads it, and shows an honest result (parsed / imported / skipped +
 * any row errors). Imported books carry no emotions — the user tags them later.
 */
export default function ImportModal({ onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const pick = (f) => {
    if (!f) return;
    if (!/\.csv$/i.test(f.name)) { setError("Please choose a .csv export."); return; }
    setError("");
    setFile(f);
  };

  const run = async () => {
    if (!file || busy) return;
    setError("");
    setBusy(true);
    try {
      const res = await importLibrary(file);
      setResult(res);
      if (res.imported > 0) onImported?.();
    } catch (err) {
      setError(err.message || "Import failed. Check the file and try again.");
    }
    setBusy(false);
  };

  return (
    <div className="imp">
      <div className="imp-head">
        <div className="label">cold start</div>
        <h2 className="imp-title">Bring your shelf with you.</h2>
        <p className="imp-sub">
          Export your library from <strong>Goodreads</strong> or <strong>StoryGraph</strong> as CSV,
          then drop it here. We dedupe against what's already shelved. Imported books arrive
          untagged — you add the feeling later.
        </p>
      </div>

      {result ? (
        <div className="imp-result" role="status" aria-live="polite">
          <div className="imp-stat-row">
            <div className="imp-stat"><span className="imp-stat-n">{result.imported}</span><span className="imp-stat-l">imported</span></div>
            <div className="imp-stat"><span className="imp-stat-n">{result.skipped}</span><span className="imp-stat-l">skipped (dupes)</span></div>
            <div className="imp-stat"><span className="imp-stat-n">{result.parsed}</span><span className="imp-stat-l">rows read</span></div>
          </div>
          {result.errors?.length > 0 && (
            <details className="imp-errors">
              <summary>{result.errors.length} row{result.errors.length === 1 ? "" : "s"} couldn't be read</summary>
              <ul>{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </details>
          )}
          <div className="imp-footer">
            <button className="btn brass" onClick={onClose}>
              {result.imported > 0 ? "see my shelf" : "done"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            className={`imp-drop ${file ? "has-file" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
          >
            <span className="imp-drop-glyph" aria-hidden="true">⇪</span>
            <span className="imp-drop-text">
              {file ? file.name : "choose a CSV, or drop it here"}
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="imp-file-input"
            onChange={(e) => pick(e.target.files?.[0])}
          />

          {error && <div className="imp-error" role="alert" aria-live="assertive">{error}</div>}

          <div className="imp-footer">
            <button className="btn ghost" onClick={onClose} disabled={busy}>cancel</button>
            <button className="btn brass" onClick={run} disabled={!file || busy}>
              {busy ? "importing…" : "import library"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

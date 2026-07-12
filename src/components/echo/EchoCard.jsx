import { useState, useRef, useEffect } from "react";
import { EMOTIONS } from "../../services/emotions";
import "./EchoCard.css";

/**
 * A single echo. [F3.3]
 *
 * DESIGN RULES enforced here:
 *  - NO counts of any kind (no likes/replies/reaction totals).
 *  - The handle is shown but is NOT a link — there is no path from the feed to a
 *    person's other content or a profile. [F3.7 "no people browsing"]
 *  - The "⋯" menu carries the safety affordances (reply / mute / block / report).
 */
function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
  catch { return ""; }
}

export default function EchoCard({ echo, onOpen, onReply, onReport, onMute, onBlock }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const emo = echo.primary_emotion ? EMOTIONS[echo.primary_emotion] : null;
  const color = emo?.color || "var(--ink)";
  const act = (fn) => () => { setMenuOpen(false); fn?.(echo); };

  return (
    <article className="eco-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="eco-top">
        <div className="eco-anchor">
          {emo && <span className="eco-emo" style={{ color }}>◉ {emo.label.toLowerCase()}</span>}
          {echo.secondary_emotion && EMOTIONS[echo.secondary_emotion] && (
            <span className="eco-emo eco-emo-sec" style={{ color: EMOTIONS[echo.secondary_emotion].color }}>
              · {EMOTIONS[echo.secondary_emotion].label.toLowerCase()}
            </span>
          )}
        </div>
        <div className="eco-menu-wrap" ref={menuRef}>
          <button
            className="eco-menu-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Echo actions"
            onClick={() => setMenuOpen((o) => !o)}
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="eco-menu" role="menu">
              <button role="menuitem" onClick={act(onReply)}>reply</button>
              <button role="menuitem" onClick={act(onMute)}>mute @{echo.handle}</button>
              <button role="menuitem" onClick={act(onBlock)}>block @{echo.handle}</button>
              <button role="menuitem" className="eco-menu-danger" onClick={act(onReport)}>report</button>
            </div>
          )}
        </div>
      </div>

      {/* Body opens the thread (replies). Keyboard-operable. */}
      <button className="eco-body-btn" onClick={() => onOpen?.(echo)}>
        <p className="eco-body">{echo.body}</p>
      </button>

      <div className="eco-foot">
        {echo.book_title && (
          <span className="eco-book">
            {echo.book_title}{echo.book_author ? ` · ${echo.book_author}` : ""}
          </span>
        )}
        {/* Handle: plain text, NOT a link — no people-browsing. [F3.7] */}
        <span className="eco-handle">@{echo.handle}</span>
        <span className="eco-date">{fmtDate(echo.created_at)}</span>
      </div>
    </article>
  );
}

import { useState, useEffect } from "react";
import { EMOTIONS } from "../../services/emotions";
import { getEchoThread, postReply, reactToEcho } from "../../services/api";
import "./EchoThread.css";

/**
 * Echo thread: the echo + its replies + a reply box. [F3.4 / B3.4]
 *
 * Replies are shown BEFORE any reaction affordance — conversation is the point.
 * Reactions are private (the viewer never sees a count; only the author can, via
 * a separate endpoint), so here they are just silent personal toggles. [B3.5]
 */
const REACTIONS = [
  { kind: "felt_this",        label: "underlined" },
  { kind: "adding_to_list",   label: "to my shelf" },
  { kind: "changed_my_mind",  label: "made me reconsider" },
];

const MAX_REPLY = 500;

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
  catch { return ""; }
}

export default function EchoThread({ echoId, onReport }) {
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [myReactions, setMyReactions] = useState({});

  useEffect(() => {
    let alive = true;
    getEchoThread(echoId)
      .then((t) => { if (alive) setThread(t); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [echoId]);

  const submitReply = async () => {
    if (!reply.trim() || posting) return;
    setError("");
    setPosting(true);
    try {
      const saved = await postReply(echoId, reply.trim());
      setThread((t) => ({ ...t, replies: [...(t?.replies || []), saved] }));
      setReply("");
    } catch (err) {
      setError(err.message || "Couldn't post your reply.");
    }
    setPosting(false);
  };

  const toggleReaction = async (kind) => {
    const on = !myReactions[kind];
    setMyReactions((r) => ({ ...r, [kind]: on })); // optimistic, silent
    try { await reactToEcho(echoId, kind, on); }
    catch { setMyReactions((r) => ({ ...r, [kind]: !on })); }
  };

  if (loading) return <div className="et et-loading">loading…</div>;
  if (!thread?.echo) return <div className="et et-loading">This echo is no longer available.</div>;

  const echo = thread.echo;
  const emo = echo.primary_emotion ? EMOTIONS[echo.primary_emotion] : null;

  return (
    <div className="et">
      <article className="et-echo" style={{ borderLeftColor: emo?.color || "var(--ink)" }}>
        {emo && <div className="et-emo" style={{ color: emo.color }}>◉ {emo.label.toLowerCase()}</div>}
        <p className="et-body">{echo.body}</p>
        <div className="et-foot">
          {echo.book_title && <span className="et-book">{echo.book_title}{echo.book_author ? ` · ${echo.book_author}` : ""}</span>}
          <span className="et-handle">@{echo.handle}</span>
          <span className="et-date">{fmtDate(echo.created_at)}</span>
        </div>
      </article>

      {/* Replies FIRST — conversation before reactions. */}
      <div className="et-replies">
        <div className="label-sm et-replies-label">replies</div>
        {thread.replies.length === 0 ? (
          <div className="et-empty">No replies yet. Be the first to say something true.</div>
        ) : (
          <ul className="et-reply-list">
            {thread.replies.map((r) => (
              <li key={r.id} className="et-reply">
                <p className="et-reply-body">{r.body}</p>
                <div className="et-reply-foot">
                  <span className="et-handle">@{r.handle}</span>
                  <span className="et-date">{fmtDate(r.created_at)}</span>
                  {onReport && (
                    <button className="et-reply-report" onClick={() => onReport(r)}>report</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="et-replybox">
        <textarea
          className="et-reply-input"
          placeholder="Say something true…"
          value={reply}
          maxLength={MAX_REPLY}
          onChange={(e) => setReply(e.target.value)}
          rows={2}
          aria-label="Your reply"
        />
        {error && <div className="et-error" role="alert" aria-live="assertive">{error}</div>}
        <div className="et-replybox-foot">
          <span className="et-count">{reply.length}/{MAX_REPLY}</span>
          <button className="btn brass" onClick={submitReply} disabled={!reply.trim() || posting}>
            {posting ? "posting…" : "reply"}
          </button>
        </div>
      </div>

      {/* Reactions come AFTER replies. Private — no counts shown. */}
      <div className="et-reactions" role="group" aria-label="Private reactions">
        {REACTIONS.map((r) => (
          <button
            key={r.kind}
            type="button"
            aria-pressed={!!myReactions[r.kind]}
            className={`et-react ${myReactions[r.kind] ? "active" : ""}`}
            onClick={() => toggleReaction(r.kind)}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

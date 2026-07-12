import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useJournal } from "../contexts/JournalContext";
import { EMOTIONS } from "../services/emotions";
import { getMyProfile, updateMyProfile } from "../services/api";
import DNACard from "../components/DNACard";
import CollectionsEditor from "../components/profile/CollectionsEditor";
import "./ProfilePage.css";

/**
 * The profile as private mirror — the self-view. [F2.8 / §Feature 2]
 *
 * "A reader's identity through their reading, not through metrics." Renders the
 * blueprint's information hierarchy from the composed /me/profile: identity strip
 * → Now → signature → collections → history → milestones. No follower counts, no
 * profile-view counts, no comparison — only substance.
 */
function BookCard({ book, onClick }) {
  const emo = book.dominant_emotion ? EMOTIONS[book.dominant_emotion] : null;
  return (
    <div className="pf-book" style={{ borderColor: emo?.color || "var(--rule)" }}>
      {book.cover_url ? (
        <img className="pf-book-cover" src={book.cover_url} alt="" loading="lazy" onError={(e) => { e.target.style.visibility = "hidden"; }} />
      ) : (
        <div className="pf-book-cover pf-book-cover--none" style={{ background: emo?.color || "var(--ink-quiet)" }} />
      )}
      <div className="pf-book-meta">
        <div className="pf-book-title">{book.title}</div>
        {book.author && <div className="pf-book-author">{book.author}</div>}
      </div>
    </div>
  );
}

function BioEditor({ bio, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(bio || "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try { await onSave(draft.trim() || null); setEditing(false); }
    finally { setBusy(false); }
  };

  if (!editing) {
    return (
      <div className="pf-bio">
        {bio ? <p className="pf-bio-text">{bio}</p> : <p className="pf-bio-empty">Add a line about how you read.</p>}
        <button className="pf-bio-edit" onClick={() => { setDraft(bio || ""); setEditing(true); }}>
          {bio ? "edit" : "+ add"}
        </button>
      </div>
    );
  }
  return (
    <div className="pf-bio">
      <textarea
        className="pf-bio-input"
        value={draft}
        maxLength={300}
        rows={2}
        aria-label="Your bio"
        placeholder="e.g. reads for catharsis; drawn to grief and awe"
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="pf-bio-actions">
        <button className="btn ghost" onClick={() => setEditing(false)} disabled={busy}>cancel</button>
        <button className="btn brass" onClick={save} disabled={busy}>{busy ? "saving…" : "save"}</button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { entries } = useJournal();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const p = await getMyProfile();
    setProfile(p);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveBio = async (bio) => {
    const updated = await updateMyProfile({ bio });
    setProfile(updated);
  };

  if (loading) {
    return <div className="loading-screen"><div className="loading-glyph">◈</div><div className="loading-text">composing your profile…</div></div>;
  }
  if (!profile) {
    return (
      <div className="pf-page">
        <div className="empty-state">
          <div className="empty-glyph">◈</div>
          <div className="empty-title">Profile unavailable</div>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => navigate("/")}>back to shelf</button>
        </div>
      </div>
    );
  }

  const disposition = profile.personality_type;
  const nowReading = profile.now_reading || [];
  const recent = profile.recent || [];
  const milestones = profile.milestones || [];

  return (
    <div className="pf-page">
      <div className="pf-header">
        <button className="btn ghost" onClick={() => navigate("/")} style={{ fontSize: 12 }}>← back to shelf</button>
        <div className="label">· your study ·</div>
      </div>

      {/* 1. Identity strip — no counts */}
      <section className="pf-identity">
        <h1 className="pf-name">{profile.display_name || `@${profile.handle}`}</h1>
        <div className="pf-handle">@{profile.handle}</div>
        {disposition && <div className="pf-disposition">{disposition}</div>}
        <BioEditor bio={profile.bio} onSave={saveBio} />
      </section>

      {/* 2. Now */}
      {nowReading.length > 0 && (
        <section className="pf-section">
          <div className="label pf-section-label">now reading</div>
          <div className="pf-books">
            {nowReading.map((b) => <BookCard key={b.entry_id} book={b} />)}
          </div>
        </section>
      )}

      {/* 3. Emotional signature (reuses the DNA card; renders nothing if not generated) */}
      {profile.signature?.personality && (
        <section className="pf-section">
          <div className="label pf-section-label">your signature</div>
          <div className="pf-signature">
            <DNACard profile={profile.signature} username={profile.handle} />
          </div>
        </section>
      )}

      {/* 4. Collections — curated, editable for self */}
      <section className="pf-section">
        <div className="label pf-section-label">collections</div>
        <CollectionsEditor
          collections={profile.collections || []}
          shelf={entries}
          onChanged={load}
        />
      </section>

      {/* 5. Reading history (range + pattern, never a tally-as-status) */}
      {recent.length > 0 && (
        <section className="pf-section">
          <div className="label pf-section-label">recently shelved</div>
          <div className="pf-books">
            {recent.map((b) => <BookCard key={b.entry_id} book={b} />)}
          </div>
        </section>
      )}

      {/* 6. Milestones — substance only */}
      {milestones.length > 0 && (
        <section className="pf-section">
          <div className="label pf-section-label">milestones</div>
          <ul className="pf-milestones">
            {milestones.map((m) => (
              <li key={m.kind} className="pf-milestone">
                <span className="pf-milestone-glyph" aria-hidden="true">✦</span>
                {m.label}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

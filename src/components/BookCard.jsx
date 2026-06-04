import { useState } from "react";
import { EMOTIONS, getPrimaryEmotion } from "../services/emotions";
import "./BookCard.css";

export default function BookCard({ entry, index = 0, onClick, width = 144, showCaption = true }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(!entry.cover_url);

  const primary = getPrimaryEmotion(entry);
  const emos = (entry.emotions || []).slice(0, 3);

  const handleImgLoad = (e) => {
    const img = e.target;
    if (img.naturalWidth < 10 || img.naturalHeight < 10) { setImgFailed(true); return; }
    setImgLoaded(true);
  };

  const coverColor = primary.color || "var(--oxblood)";

  return (
    <div
      className="book-cover-wrap anim-fadeup"
      style={{ width, "--cover-w": `${width}px`, animationDelay: `${index * 0.05}s` }}
    >
      <div
        className="book-cover"
        onClick={onClick}
        style={{ "--cover-w": `${width}px`, "--cv-color": coverColor }}
        role="button"
        tabIndex={0}
      >
        <div className="emo-tabs">
          {emos.map((e, i) => {
            const em = EMOTIONS[e.emotion_id];
            if (!em) return null;
            return (
              <div
                key={e.emotion_id}
                className="emo-tab"
                style={{ height: 14 - i * 3, background: em.color }}
              />
            );
          })}
        </div>

        {!imgFailed && entry.cover_url && (
          <img
            src={entry.cover_url}
            alt=""
            onLoad={handleImgLoad}
            onError={() => setImgFailed(true)}
            className="cover-img"
            style={{ opacity: imgLoaded ? 1 : 0 }}
          />
        )}

        {(imgFailed || !imgLoaded || !entry.cover_url) && (
          <div className="cover-fallback">
            <div className="cf-glyph">{primary.glyph || "§"}</div>
            <div className="cf-author">{entry.author}</div>
            <div className="cf-title">{entry.title}</div>
          </div>
        )}

        <div className="int-strip">
          <div className="int-fill" style={{ width: `${(entry.intensity || 5) * 10}%` }} />
        </div>
      </div>

      {showCaption && (
        <div className="book-caption">
          <div className="bc-title">{entry.title}</div>
          <div className="bc-author">{entry.author}</div>
          <div className="bc-emos">
            {emos.map((e) => {
              const em = EMOTIONS[e.emotion_id];
              if (!em) return null;
              return <span key={e.emotion_id} className="bc-dot" style={{ background: em.color }} />;
            })}
            <span className="bc-int">{entry.intensity ?? "—"}/10</span>
          </div>
        </div>
      )}
    </div>
  );
}

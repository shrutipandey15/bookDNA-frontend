import { useState } from "react";
import { EMOTIONS, getPrimaryEmotion } from "../services/emotions";
import "./BookCard.css";

function openLibraryCover(title) {
  if (!title) return null;
  return `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-M.jpg?default=false`;
}

export default function BookCard({ entry, index, onClick }) {
  const coverSources = [
    entry.cover_url,
    openLibraryCover(entry.title),
  ].filter(Boolean);

  const [coverIndex, setCoverIndex] = useState(0);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [allFailed, setAllFailed] = useState(coverSources.length === 0);
  const emo = getPrimaryEmotion(entry);

  const handleCoverError = () => {
    const next = coverIndex + 1;
    if (next < coverSources.length) {
      setCoverIndex(next);
      setCoverLoaded(false);
    } else {
      setAllFailed(true);
    }
  };

  const handleImageLoad = (e) => {
    if (e.target.naturalWidth < 10 || e.target.naturalHeight < 10) {
      handleCoverError();
    } else {
      setCoverLoaded(true);
    }
  };

  return (
    <div
      className="book-card"
      style={{ "--accent": emo.color, "--delay": `${index * 0.07}s` }}
      onClick={onClick}
    >
      <div className="book-cover-wrap">
        <div className="book-spine" style={{ background: emo.color }} />
        <div className="book-cover">
          {!allFailed && (
            <img
              src={coverSources[coverIndex]}
              alt=""
              onLoad={handleImageLoad}
              onError={handleCoverError}
              className={`cover-img ${coverLoaded ? "loaded" : ""}`}
            />
          )}
          {(!coverLoaded || allFailed) && (
            <div
              className="cover-fallback"
              style={{ background: `linear-gradient(145deg, ${emo.color}33, #0c0c10)` }}
            >
              <div className="fb-title">{entry.title}</div>
              <div className="fb-author">{entry.author}</div>
              <div className="fb-glyph">{emo.icon}</div>
            </div>
          )}
          <div className="emo-tabs">
            {entry.emotions?.slice(0, 3).map((e, i) => (
              <div
                key={e.emotion_id}
                className="emo-tab"
                style={{
                  background: EMOTIONS[e.emotion_id]?.color,
                  right: `${8 + i * 16}px`,
                  height: `${14 - i * 2}px`,
                }}
              />
            ))}
          </div>
          <div className="int-edge">
            <div
              className="int-fill"
              style={{
                height: `${(entry.intensity || 5) * 10}%`,
                background: `linear-gradient(to top, ${emo.color}, ${emo.color}44)`,
              }}
            />
          </div>
        </div>
        <div className="page-edges" />
      </div>
      <div className="book-meta">
        <div className="bm-title">{entry.title}</div>
        <div className="bm-author">{entry.author}</div>
        <div className="bm-pills">
          {entry.emotions?.slice(0, 4).map((e) => (
            <span key={e.emotion_id} className="bm-pill">
              {EMOTIONS[e.emotion_id]?.icon}
            </span>
          ))}
          <span className="bm-int">{entry.intensity}/10</span>
        </div>
      </div>
    </div>
  );
}
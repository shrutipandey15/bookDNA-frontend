import { useState, useEffect } from "react";
import { fetchBlob } from "../services/api";
import "./ShareModal.css";

export default function ShareModal({ isOpen, onClose, endpoint, filename }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen && endpoint) {
      setLoading(true);
      setError(false);
      setImageUrl(null);

      fetchBlob(endpoint)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to generate image", err);
          setError(true);
          setLoading(false);
        });
    }
  }, [isOpen, endpoint]);

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = filename || "bookdna-share.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2 className="modal-title">Share to Socials</h2>
        <p className="modal-subtitle">Download this card and post it to your Story.</p>

        <div className="share-preview-area">
          {loading && <div className="share-loader">Generating your vibe...</div>}
          {error && <div className="share-error">Could not generate image. Try again.</div>}
          {imageUrl && <img src={imageUrl} alt="Share Preview" className="share-image" />}
        </div>

        <div className="modal-actions">
          <button 
            className="action-btn primary" 
            onClick={handleDownload} 
            disabled={!imageUrl || loading}
          >
            Download Image 
          </button>
        </div>
      </div>
    </div>
  );
}
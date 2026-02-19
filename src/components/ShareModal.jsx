import { useState, useEffect } from "react";
import { fetchBlob } from "../services/api";
import "./ShareModal.css";

export default function ShareModal({ isOpen, onClose, endpoint, filename, shareToken }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink = shareToken
    ? `${window.location.origin}/s/${shareToken}`
    : null;

  useEffect(() => {
    if (isOpen && endpoint) {
      setLoading(true);
      setError(false);
      setImageUrl(null);
      setCopied(false);

      fetchBlob(endpoint)
        .then((blob) => {
          setImageUrl(URL.createObjectURL(blob));
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [isOpen, endpoint]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename || "bookdna-share.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = shareLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      const shareData = {
        title: "My Book DNA",
        text: "Check out my reading personality!",
        url: shareLink,
      };
      await navigator.share(shareData);
    } catch {
      // User cancelled or share failed — not an error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h2 className="modal-title">Share Your DNA</h2>
        <p className="modal-subtitle">Show the world what kind of reader you are.</p>

        <div className="share-preview-area">
          {loading && <div className="share-loader">Generating your vibe...</div>}
          {error && <div className="share-error">Could not generate image. Try again.</div>}
          {imageUrl && <img src={imageUrl} alt="Share Preview" className="share-image" />}
        </div>

        {shareLink && (
          <div className="share-link-row">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="share-link-input"
              onClick={(e) => e.target.select()}
            />
            <button className="share-link-copy" onClick={handleCopyLink}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        <div className="modal-actions">
          <button
            className="action-btn primary"
            onClick={handleDownload}
            disabled={!imageUrl || loading}
          >
            Download Image
          </button>
          {shareLink && navigator.share && (
            <button className="action-btn secondary" onClick={handleNativeShare}>
              Share Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import "./CrisisInterstitial.css";

/**
 * Crisis interstitial. [F3.6 / B3.8]
 *
 * Shown when the backend's self-harm classifier flags an echo the author is
 * posting. This is supportive, NOT punitive — no "your post was blocked", no
 * shame. Calm message + real resources. The echo may still have been held; the
 * point here is care, not enforcement.
 *
 * Payload shape (from EchoCreateResponse.crisis):
 *   { message: string, resources: [{ name, url?, phone?, sms?, ... }] }
 */
export default function CrisisInterstitial({ crisis, onClose }) {
  const resources = crisis?.resources || [];
  return (
    <div className="crisis" role="dialog" aria-label="Support resources">
      <div className="crisis-glyph" aria-hidden="true">♡</div>
      <p className="crisis-message">
        {crisis?.message || "It sounds like you're going through something heavy. You're not alone, and help is available."}
      </p>

      {resources.length > 0 && (
        <ul className="crisis-resources">
          {resources.map((r, i) => (
            <li key={i} className="crisis-resource">
              <span className="crisis-resource-name">{r.name}</span>
              {r.phone && <a className="crisis-resource-link" href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>{r.phone}</a>}
              {r.sms && <span className="crisis-resource-detail">text {r.sms}</span>}
              {r.url && (
                <a className="crisis-resource-link" href={r.url} target="_blank" rel="noopener noreferrer">
                  {r.url.replace(/^https?:\/\//, "")}
                </a>
              )}
              {r.description && <span className="crisis-resource-detail">{r.description}</span>}
            </li>
          ))}
        </ul>
      )}

      <div className="crisis-footer">
        <button className="btn brass" onClick={onClose}>close</button>
      </div>
    </div>
  );
}

import "./WelcomeModal.css";

/**
 * First-run welcome. [F2.10 / blueprint onboarding]
 *
 * Deliberately NOT a feature tour. One calm screen that names the ritual and
 * offers a single primary action: log one book well. Shown once (localStorage-
 * gated by the caller), then never again.
 */
export default function WelcomeModal({ onBegin, onDismiss }) {
  return (
    <div className="wel">
      <div className="label wel-eyebrow">· welcome ·</div>
      <h2 className="wel-title">
        A slow ritual,<br /><em>one book at a time.</em>
      </h2>
      <p className="wel-body">
        This isn't a place for ratings or reviews. It's a private record of what
        books <em>did</em> to you — the actual weather they left behind.
      </p>
      <p className="wel-body">
        Don't try to fill a shelf today. Begin with <strong>one</strong> book —
        not the impressive one, the one that stayed with you — and tell the truth
        about how it felt.
      </p>

      <div className="wel-actions">
        <button className="btn brass" onClick={onBegin}>begin with one book</button>
        <button className="btn ghost" onClick={onDismiss}>I'll look around first</button>
      </div>
    </div>
  );
}

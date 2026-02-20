import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./ResetPassword.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");

  // If token is present → reset form. If not → forgot form.
  return token ? <ResetForm token={token} /> : <ForgotForm />;
}

function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Something went wrong.");
      }
    } catch {
      setError("Could not reach the server.");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="reset-page">
        <div className="reset-card">
          <div className="reset-logo">BOOK <span>DNA</span></div>
          <div className="reset-glyph success">✓</div>
          <div className="reset-title">Check your email</div>
          <div className="reset-sub">If that email is registered, you'll receive a reset link within a few minutes.</div>
          <Link to="/" className="reset-btn">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-card">
        <div className="reset-logo">BOOK <span>DNA</span></div>
        <div className="reset-title">Forgot Password</div>
        <div className="reset-sub">Enter your email and we'll send you a reset link.</div>

        <form onSubmit={handleSubmit} className="reset-form">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="reset-input"
            autoComplete="email"
          />
          {error && <div className="reset-error">{error}</div>}
          <button type="submit" disabled={loading} className="reset-submit">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link to="/" className="reset-back">← Back to login</Link>
      </div>
    </div>
  );
}

function ResetForm({ token }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Reset failed.");
      }
    } catch {
      setError("Could not reach the server.");
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="reset-page">
        <div className="reset-card">
          <div className="reset-logo">BOOK <span>DNA</span></div>
          <div className="reset-glyph success">✓</div>
          <div className="reset-title">Password Updated</div>
          <div className="reset-sub">You can now log in with your new password.</div>
          <Link to="/" className="reset-btn">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-card">
        <div className="reset-logo">BOOK <span>DNA</span></div>
        <div className="reset-title">Set New Password</div>

        <form onSubmit={handleSubmit} className="reset-form">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="reset-input"
            autoComplete="new-password"
            minLength={8}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="reset-input"
            autoComplete="new-password"
          />
          {error && <div className="reset-error">{error}</div>}
          <button type="submit" disabled={loading} className="reset-submit">
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
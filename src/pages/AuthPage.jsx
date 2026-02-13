import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./AuthPage.css";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, username, password, displayName);
      }
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          BOOK <span>DNA</span>
        </div>
        <div className="auth-tagline">
          The emotional fingerprint of your reading life
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <>
              <input
                type="text" placeholder="Username (no spaces)"
                value={username} onChange={(e) => setUsername(e.target.value)}
                required className="auth-input"
              />
              <input
                type="text" placeholder="Display Name"
                value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="auth-input"
              />
            </>
          )}
          <input
            type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required className="auth-input"
          />
          <input
            type="password" placeholder="Password (min 8 chars)"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={8} className="auth-input"
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Enter" : "Start Your DNA"}
          </button>
        </form>
      </div>
    </div>
  );
}
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./AuthPage.css";

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  const levels = [
    { label: "", color: "" },
    { label: "Weak", color: "#C4553A" },
    { label: "Fair", color: "#C47A3A" },
    { label: "Good", color: "#B8964E" },
    { label: "Strong", color: "#7A8B6F" },
    { label: "Very strong", color: "#5A8B6F" },
  ];
  return { score, ...levels[score] };
}

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  const startCooldown = (seconds) => {
    setCooldown(seconds);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const validate = () => {
    if (mode === "register") {
      if (!username.trim() || username.length < 3) return "Username must be at least 3 characters";
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) return "Username: letters, numbers, _ and - only";
      if (password.length < 8) return "Password must be at least 8 characters";
      const strength = passwordStrength(password);
      if (strength.score < 2) return "Password is too weak. Add uppercase, numbers, or symbols.";
    }
    if (!email.includes("@") || !email.includes(".")) return "Please enter a valid email";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(email.toLowerCase().trim(), username.trim(), password, displayName.trim() || undefined);
      }
      await login(email.toLowerCase().trim(), password);
    } catch (err) {
      const msg = err.message || "Something went wrong";
      setError(msg);

      const minuteMatch = msg.match(/(\d+)\s*minute/);
      if (minuteMatch) {
        startCooldown(parseInt(minuteMatch[1]) * 60);
      } else if (msg.includes("Too many")) {
        startCooldown(60);
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = mode === "register" ? passwordStrength(password) : null;
  const isDisabled = loading || cooldown > 0;

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
            onClick={() => { setMode("login"); setError(""); setEmail(""); setPassword(""); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setError(""); setEmail(""); setPassword(""); setUsername(""); setDisplayName(""); }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="Username (letters, numbers, _ -)"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                required minLength={3} maxLength={50}
                autoComplete="username"
                className="auth-input"
              />
              <input
                type="text"
                placeholder="Display Name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                className="auth-input"
              />
            </>
          )}
          <input
            type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email"
            className="auth-input"
          />
          <div className="auth-pw-wrap">
            <input
              type="password"
              placeholder={mode === "register" ? "Password (min 8 chars)" : "Password"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={mode === "register" ? 8 : 1}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              className="auth-input"
            />
            {strength && password.length > 0 && (
              <div className="auth-strength">
                <div className="auth-strength-bar">
                  <div
                    className="auth-strength-fill"
                    style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }}
                  />
                </div>
                <span className="auth-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {error && <div className="auth-error">{error}</div>}

          {cooldown > 0 && (
            <div className="auth-cooldown">
              Locked out. Try again in {Math.ceil(cooldown / 60)}:{String(cooldown % 60).padStart(2, "0")}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={isDisabled}>
            {loading ? "..." : cooldown > 0 ? "Locked" : mode === "login" ? "Enter" : "Start Your DNA"}
          </button>

          {mode === "login" && (
            <Link to="/reset-password" className="auth-forgot">Forgot password?</Link>
          )}
        </form>
      </div>
    </div>
  );
}
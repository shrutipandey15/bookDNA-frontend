import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getSettings, updateSettings, changePassword } from "../services/api";
import { clearCache } from "../services/offline";
import "./SettingsPage.css";

const SECTIONS = [
  { id: "profile",  label: "Profile",        glyph: "◐" },
  { id: "account",  label: "Account",        glyph: "◈" },
  { id: "security", label: "Security",       glyph: "✦" },
  { id: "data",     label: "Your data",      glyph: "◇" },
  { id: "danger",   label: "Danger zone",    glyph: "×" },
];

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [section, setSection] = useState("profile");
  const [displayName, setDisplayName] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    getSettings().then((s) => { if (s) setDisplayName(s.display_name || ""); });
  }, []);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await updateSettings({ display_name: displayName.trim() });
      if (refreshUser) await refreshUser();
      showToast("Profile updated", "success");
    } catch (err) { showToast(err.message); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) return;
    if (newPw.length < 8) { showToast("New password must be at least 8 characters"); return; }
    if (newPw !== confirmPw) { showToast("Passwords don't match"); return; }
    setChangingPw(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showToast("Password changed", "success");
    } catch (err) { showToast(err.message); }
    setChangingPw(false);
  };

  const handleLogout = () => {
    logout(); clearCache(); navigate("/");
  };

  return (
    <div className="set-page">
      <div className="set-header">
        <button className="btn ghost" onClick={() => navigate("/")} style={{ fontSize: 12 }}>← back to shelf</button>
        <div>
          <div className="label" style={{ marginBottom: 6 }}>· housekeeping ·</div>
          <h1 className="set-h1">The <em>Drawer</em>.</h1>
        </div>
        <div className="set-header-stat">
          <div className="label-sm">member since</div>
          <div className="set-stat-val">{user?.created_at ? new Date(user.created_at).getFullYear() : "—"}</div>
        </div>
      </div>
      <div className="rule-dbl" style={{ marginBottom: 24 }} />

      <div className="set-grid">
        {/* RAIL */}
        <nav className="set-rail">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`set-rail-item ${section === s.id ? "active" : ""}`}
              onClick={() => setSection(s.id)}
            >
              <span className="set-rail-glyph">{s.glyph}</span>
              <span>{s.label}</span>
            </button>
          ))}
          {user?.is_admin && (
            <button className="set-rail-item" onClick={() => navigate("/admin")}>
              <span className="set-rail-glyph">‡</span>
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* BODY */}
        <div className="set-body">
          {section === "profile" && (
            <div className="card editorial set-card">
              <div className="label" style={{ marginBottom: 12 }}>profile</div>
              <h3 className="set-card-h">How the world sees you.</h3>
              <div className="set-field">
                <div className="label-sm set-field-label">display name</div>
                <input
                  className="set-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  maxLength={100}
                />
              </div>
              <button className="btn brass" onClick={handleSaveProfile} disabled={saving || !displayName.trim()}>
                <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15 }}>
                  {saving ? "Saving" : "Save"}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>PROFILE</span>
              </button>
            </div>
          )}

          {section === "account" && (
            <div className="card editorial set-card">
              <div className="label" style={{ marginBottom: 12 }}>account</div>
              <h3 className="set-card-h">The boring particulars.</h3>
              <Field label="username" value={user?.username || "—"} />
              <Field label="email"    value={user?.email || "—"} />
              <Field label="reading personality" value={user?.personality_type || "not generated yet"} />
            </div>
          )}

          {section === "security" && (
            <div className="card editorial set-card">
              <div className="label" style={{ marginBottom: 12 }}>change password</div>
              <h3 className="set-card-h">Write a new key.</h3>
              <div className="set-field">
                <div className="label-sm set-field-label">current password</div>
                <input className="set-input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="your current key" />
              </div>
              <div className="set-field">
                <div className="label-sm set-field-label">new password</div>
                <input className="set-input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="min 8 chars" />
              </div>
              <div className="set-field">
                <div className="label-sm set-field-label">confirm</div>
                <input className="set-input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="and again" />
              </div>
              <button className="btn brass" onClick={handleChangePassword} disabled={changingPw || !currentPw || !newPw || !confirmPw}>
                <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15 }}>
                  {changingPw ? "Writing" : "Change"}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>PASSWORD</span>
              </button>
            </div>
          )}

          {section === "data" && (
            <div className="card editorial set-card">
              <div className="label" style={{ marginBottom: 12 }}>your data</div>
              <h3 className="set-card-h">Yours — fully.</h3>
              <p className="set-card-d">
                No ads. No selling. No third-party tracking. The shelf is private by default.
              </p>
              <p className="set-card-d">
                Public echoes are explicitly opt-in, per entry.
              </p>
            </div>
          )}

          {section === "danger" && (
            <div className="card editorial set-card set-danger">
              <div className="label" style={{ marginBottom: 12, color: "var(--oxblood)" }}>danger zone</div>
              <h3 className="set-card-h">Close the drawer.</h3>
              <p className="set-card-d">Signing out clears your local cache.</p>
              <button className="btn oxblood" onClick={handleLogout}>sign out</button>
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`} onClick={() => setToast(null)}>{toast.message}</div>}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="set-field">
      <div className="label-sm set-field-label">{label}</div>
      <div className="set-field-value">{value}</div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getSettings, updateSettings, changePassword } from "../services/api";
import { clearCache } from "../services/offline";

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

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
    getSettings().then((s) => {
      if (s) setDisplayName(s.display_name || "");
    });
  }, []);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await updateSettings({ display_name: displayName.trim() });
      if (refreshUser) await refreshUser();
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(err.message);
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) return;
    if (newPw.length < 8) { showToast("New password must be at least 8 characters"); return; }
    if (newPw !== confirmPw) { showToast("Passwords don't match"); return; }

    setChangingPw(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      showToast("Password changed", "success");
    } catch (err) {
      showToast(err.message);
    }
    setChangingPw(false);
  };

  const handleLogout = () => {
    logout();
    clearCache();
    navigate("/");
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <button className="settings-back" onClick={() => navigate("/")}>←</button>
        <h1 className="settings-title">Settings</h1>
      </header>

      <div className="settings-sections">
        <section className="settings-section">
          <div className="section-label">Account</div>
          <div className="settings-field">
            <label className="field-label">Username</label>
            <div className="field-value">{user?.username}</div>
          </div>
          <div className="settings-field">
            <label className="field-label">Email</label>
            <div className="field-value">{user?.email}</div>
          </div>
          <div className="settings-field">
            <label className="field-label">Reading Personality</label>
            <div className="field-value">{user?.personality_type || "Not generated yet"}</div>
          </div>
        </section>

        <section className="settings-section">
          <div className="section-label">Profile</div>
          <div className="settings-field">
            <label className="field-label">Display Name</label>
            <input
              className="settings-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={100}
            />
          </div>
          <button
            className="settings-btn"
            onClick={handleSaveProfile}
            disabled={saving || !displayName.trim()}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </section>

        <section className="settings-section">
          <div className="section-label">Change Password</div>
          <div className="settings-field">
            <label className="field-label">Current Password</label>
            <input
              className="settings-input"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="settings-field">
            <label className="field-label">New Password</label>
            <input
              className="settings-input"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Min 8 characters"
            />
          </div>
          <div className="settings-field">
            <label className="field-label">Confirm New Password</label>
            <input
              className="settings-input"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <button
            className="settings-btn"
            onClick={handleChangePassword}
            disabled={changingPw || !currentPw || !newPw || !confirmPw}
          >
            {changingPw ? "Changing..." : "Change Password"}
          </button>
        </section>

        <section className="settings-section settings-danger">
          <button className="settings-btn danger" onClick={handleLogout}>
            Log Out
          </button>
        </section>

        {user?.is_admin && (
          <section className="settings-section">
            <div className="section-label">Admin</div>
            <button className="settings-btn" onClick={() => navigate("/admin")}>
              Open Admin Dashboard
            </button>
          </section>
        )}
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`} onClick={() => setToast(null)}>
          {toast.message}
        </div>
      )}

      <style>{`
        .settings-page {
          max-width: 480px;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }
        .settings-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .settings-back {
          background: none;
          border: none;
          color: #888;
          font-size: 1.3rem;
          cursor: pointer;
          padding: 4px 8px;
        }
        .settings-back:hover { color: #fff; }
        .settings-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 1.4rem;
          font-weight: 600;
          margin: 0;
          color: #e0ddd8;
        }
        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .settings-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 20px;
        }
        .section-label {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 16px;
        }
        .settings-field {
          margin-bottom: 14px;
        }
        .field-label {
          display: block;
          font-size: 12px;
          color: #888;
          margin-bottom: 4px;
          font-family: var(--font-mono, monospace);
        }
        .field-value {
          font-size: 14px;
          color: #c0bdb8;
          padding: 8px 0;
        }
        .settings-input {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #e0ddd8;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .settings-input:focus {
          border-color: rgba(184,150,78,0.4);
        }
        .settings-input::placeholder { color: #555; }
        .settings-btn {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #c0bdb8;
          font-size: 13px;
          font-family: var(--font-mono, monospace);
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .settings-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .settings-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .settings-btn.danger {
          color: #C4553A;
          border-color: rgba(196,85,58,0.2);
        }
        .settings-btn.danger:hover {
          background: rgba(196,85,58,0.1);
        }
        .settings-danger {
          background: none;
          border: none;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
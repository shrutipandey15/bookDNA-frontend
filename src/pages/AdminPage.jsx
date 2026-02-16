import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../services/api";
import "./AdminPage.css";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("dashboard");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadDashboard = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        apiFetch("/admin/dashboard"),
        apiFetch("/admin/users"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (e) {
      showToast("Failed to load admin data", "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user?.is_admin) { navigate("/"); return; }
    loadDashboard();
  }, [user, navigate, loadDashboard]);

  const loadDbHealth = async () => {
    const res = await apiFetch("/admin/db-health");
    if (res.ok) setDbHealth(await res.json());
  };

  const cleanupTokens = async () => {
    const res = await apiFetch("/admin/cleanup-tokens", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      showToast(`Cleaned up ${data.deleted} expired tokens`);
      loadDashboard();
    }
  };

  const viewUser = async (userId) => {
    const res = await apiFetch(`/admin/users/${userId}`);
    if (res.ok) setSelectedUser(await res.json());
  };

  const deleteUser = async (userId, username) => {
    if (!confirm(`Delete user "${username}" and ALL their data? This cannot be undone.`)) return;
    const res = await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      showToast(`User ${username} deleted`);
      setSelectedUser(null);
      loadDashboard();
    } else {
      const d = await res.json().catch(() => ({}));
      showToast(d.detail || "Delete failed", "error");
    }
  };

  if (loading) return <div className="admin-page"><div className="admin-loading">Loading admin...</div></div>;
  if (!user?.is_admin) return null;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <button className="admin-back" onClick={() => navigate("/")}>←</button>
        <h1 className="admin-title">Admin</h1>
        <div className="admin-tabs">
          {["dashboard", "users", "database"].map((t) => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? "active" : ""}`}
              onClick={() => { setTab(t); if (t === "database") loadDbHealth(); }}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {tab === "dashboard" && stats && (
        <div className="admin-section">
          <div className="admin-grid">
            <Stat label="Users" value={stats.total_users} />
            <Stat label="Books Logged" value={stats.total_entries} />
            <Stat label="Echoes" value={stats.total_echoes} />
            <Stat label="DNA Generated" value={stats.total_dna_generated} />
            <Stat label="New Users (7d)" value={stats.users_last_7d} />
            <Stat label="New Entries (7d)" value={stats.entries_last_7d} />
            <Stat label="DB Size" value={`${stats.db_size_mb} MB`} />
            <Stat label="Expired Tokens" value={stats.expired_refresh_tokens} />
          </div>
          {stats.expired_refresh_tokens > 0 && (
            <button className="admin-action-btn" onClick={cleanupTokens}>
              Cleanup {stats.expired_refresh_tokens} expired tokens
            </button>
          )}
        </div>
      )}

      {tab === "users" && !selectedUser && (
        <div className="admin-section">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Books</th>
                  <th>Personality</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} onClick={() => viewUser(u.id)}>
                    <td>
                      <div className="admin-username">
                        {u.username}
                        {u.is_admin && <span className="admin-badge">admin</span>}
                      </div>
                      <div className="admin-email">{u.email}</div>
                    </td>
                    <td>{u.book_count}</td>
                    <td>{u.personality_type || "—"}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "users" && selectedUser && (
        <div className="admin-section">
          <button className="admin-back-link" onClick={() => setSelectedUser(null)}>← Back to users</button>
          <div className="admin-user-detail">
            <h2 className="admin-detail-name">{selectedUser.username}</h2>
            <div className="admin-detail-grid">
              <div className="admin-detail-item"><span className="admin-detail-label">Email</span> {selectedUser.email}</div>
              <div className="admin-detail-item"><span className="admin-detail-label">Display Name</span> {selectedUser.display_name || "—"}</div>
              <div className="admin-detail-item"><span className="admin-detail-label">Personality</span> {selectedUser.personality_type || "Not generated"}</div>
              <div className="admin-detail-item"><span className="admin-detail-label">Books</span> {selectedUser.book_count}</div>
              <div className="admin-detail-item"><span className="admin-detail-label">DNA Dirty</span> {selectedUser.dna_dirty ? "Yes" : "No"}</div>
              <div className="admin-detail-item"><span className="admin-detail-label">Share Token</span> {selectedUser.share_token || "None"}</div>
              <div className="admin-detail-item"><span className="admin-detail-label">Joined</span> {new Date(selectedUser.created_at).toLocaleString()}</div>
            </div>

            {selectedUser.entries.length > 0 && (
              <>
                <h3 className="admin-subhead">Books ({selectedUser.entries.length})</h3>
                <div className="admin-entry-list">
                  {selectedUser.entries.map((e) => (
                    <div key={e.id} className="admin-entry-row">
                      <span className="admin-entry-title">{e.title}</span>
                      <span className="admin-entry-meta">{e.author} · {e.intensity}/10</span>
                      <span className="admin-entry-emo">{e.emotions.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!selectedUser.is_admin && (
              <button className="admin-danger-btn" onClick={() => deleteUser(selectedUser.id, selectedUser.username)}>
                Delete User
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "database" && (
        <div className="admin-section">
          {dbHealth ? (
            <>
              <div className={`admin-status-badge ${dbHealth.status === "healthy" ? "healthy" : "unhealthy"}`}>
                {dbHealth.status === "healthy" ? "✓" : "✗"} {dbHealth.status} · {dbHealth.db_size_mb} MB
              </div>
              {dbHealth.tables && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Table</th><th>Rows</th></tr>
                    </thead>
                    <tbody>
                      {dbHealth.tables.map((t) => (
                        <tr key={t.table}><td>{t.table}</td><td>{t.rows}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="admin-loading">Loading...</div>
          )}

          <div className="admin-cmd-section">
            <h3 className="admin-subhead">Backup Command</h3>
            <div className="admin-code-block">
              pg_dump -U bookdna -d bookdna -F c -f bookdna_backup_$(date +%Y%m%d).dump
            </div>
            <h3 className="admin-subhead">Restore Command</h3>
            <div className="admin-code-block">
              pg_restore -U bookdna -d bookdna -c bookdna_backup_YYYYMMDD.dump
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-toast ${toast.type === "error" ? "error" : ""}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-val">{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}
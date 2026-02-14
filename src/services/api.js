const API_BASE = "/api";

// ── Token management ──
export function getTokens() {
  try {
    return JSON.parse(localStorage.getItem("bookdna_tokens"));
  } catch {
    return null;
  }
}

export function saveTokens(tokens) {
  localStorage.setItem("bookdna_tokens", JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem("bookdna_tokens");
}

export function isAuthed() {
  return !!getTokens()?.access_token;
}

// ── Core fetch wrapper with auto-refresh ──
async function apiFetch(path, opts = {}) {
  const tokens = getTokens();
  const headers = { "Content-Type": "application/json", ...opts.headers };
  if (tokens?.access_token) {
    headers["Authorization"] = `Bearer ${tokens.access_token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  // Auto-refresh on 401
  if (res.status === 401 && tokens?.refresh_token && !opts._retried) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: tokens.refresh_token }),
    });

    if (refreshRes.ok) {
      const newTokens = await refreshRes.json();
      saveTokens(newTokens);
      return apiFetch(path, { ...opts, _retried: true });
    } else {
      clearTokens();
      window.location.reload();
    }
  }

  return res;
}

// ── Auth ──
export async function register(email, username, password, displayName) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      username,
      password,
      display_name: displayName || username,
    }),
  });
  if (!res.ok) {
    const d = await res.json();
    throw new Error(d.detail || "Registration failed");
  }
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const d = await res.json();
    throw new Error(d.detail || "Login failed");
  }
  const tokens = await res.json();
  saveTokens(tokens);
  return tokens;
}

export async function getMe() {
  const res = await apiFetch("/auth/me");
  if (!res.ok) return null;
  return res.json();
}

// ── Entries ──
export async function getEntries(page = 1, perPage = 100) {
  const res = await apiFetch(`/entries?page=${page}&per_page=${perPage}`);
  if (!res.ok) return { entries: [], total: 0 };
  return res.json();
}

export async function createEntry(data) {
  const res = await apiFetch("/entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create entry");
  return res.json();
}

export async function updateEntry(id, data) {
  const res = await apiFetch(`/entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update entry");
  return res.json();
}

export async function deleteEntry(id) {
  const res = await apiFetch(`/entries/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = new Error("Failed to delete entry");
    err.status = res.status;
    throw err;
  }
}

// ── DNA ──
export async function getDNAProfile() {
  const res = await apiFetch("/dna/profile");
  if (!res.ok) return null;
  return res.json();
}

export async function generateDNA() {
  const res = await apiFetch("/dna/generate", { method: "POST" });
  if (!res.ok) {
    const d = await res.json();
    throw new Error(d.detail || "Failed to generate DNA");
  }
  return res.json();
}

export async function getHeatmap() {
  const res = await apiFetch("/dna/heatmap");
  if (!res.ok) return null;
  return res.json();
}

export async function getStats() {
  const res = await apiFetch("/dna/stats");
  if (!res.ok) return null;
  return res.json();
}

export async function getDNAHistory() {
  const res = await apiFetch("/dna/history");
  if (!res.ok) return [];
  return res.json();
}

// ── User ──
export async function updateSettings(data) {
  const res = await apiFetch("/user/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}

// ── Book Search ──
export async function searchBooks(query) {
  if (!query || query.length < 2) return [];
  const res = await apiFetch(`/books/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}
import { clearCache } from "./offline";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

// Typed error so callers can tell *why* a fetch failed (rate-limited vs. server
// error vs. offline) instead of collapsing every failure into an empty result.
// `kind` is a stable, UI-friendly discriminant. [F1.2 / P5-2]
export class ApiError extends Error {
  constructor(status, kind, message) {
    super(message || kind);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind; // "rate_limited" | "server" | "offline" | "client"
  }
}

export function errorKind(status) {
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  if (status >= 400) return "client";
  return "server";
}

// Wrap apiFetch and reject with a typed ApiError on failure. Network failures
// (fetch throws) become an "offline" ApiError.
async function apiGet(path) {
  let res;
  try {
    res = await apiFetch(path);
  } catch {
    throw new ApiError(0, "offline", "Network request failed");
  }
  if (!res.ok) throw new ApiError(res.status, errorKind(res.status));
  return res.json();
}

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
  // A cleared session must never leave one account's cached shelf visible to
  // the next user. clearTokens is the single choke point every logout path
  // hits (explicit logout, invalid-token load, failed refresh). [F1.4 / P5-3]
  clearCache();
}

export function isAuthed() {
  return !!getTokens()?.access_token;
}

// ── Single-flight token refresh ──
// A rotating refresh token can only be redeemed once. If several requests 401 at
// the same time and each POSTs /auth/refresh, all but the first redeem a stale
// token, the backend revokes the session, and the user is logged out at random.
// We funnel every concurrent refresh through one shared promise so exactly one
// /auth/refresh fires per stampede. [F1.1 / P2-11]
let refreshPromise = null;

async function doRefresh(refreshToken) {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) throw new Error("refresh_failed");
  const newTokens = await res.json();
  saveTokens(newTokens);
  return newTokens;
}

function refreshOnce(refreshToken) {
  if (!refreshPromise) {
    refreshPromise = doRefresh(refreshToken).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ── Core fetch wrapper with auto-refresh ──
export async function apiFetch(path, opts = {}) {
  const tokens = getTokens();
  const headers = { "Content-Type": "application/json", ...opts.headers };
  if (tokens?.access_token) {
    headers["Authorization"] = `Bearer ${tokens.access_token}`;
  }

  // Handle blob responses (don't set Content-Type if body is FormData, etc.)
  if (opts.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  // Auto-refresh on 401 (single-flight; retry once with the fresh token)
  if (res.status === 401 && tokens?.refresh_token && !opts._retried) {
    try {
      await refreshOnce(tokens.refresh_token);
    } catch {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/";
      return res;
    }
    return apiFetch(path, { ...opts, _retried: true });
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
  // Throws ApiError on failure so an empty shelf (real) is never confused with a
  // 500/429 (an error the user must see). [F1.2 / P5-2]
  return apiGet(`/entries?page=${page}&per_page=${perPage}`);
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

export async function generateShareToken() {
  const res = await apiFetch("/user/share-token", { method: "POST" });
  if (!res.ok) throw new Error("Failed to generate share link");
  return res.json();
}

export async function getSharedDNA(token) {
  const res = await apiFetch(`/public/shared/${token}`);
  if (!res.ok) return null;
  return res.json();
}

// ── User ──
export async function getSettings() {
  const res = await apiFetch("/user/settings");
  if (!res.ok) return null;
  return res.json();
}

export async function updateSettings(data) {
  const res = await apiFetch("/user/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "Failed to update settings");
  }
  return res.json();
}

export async function changePassword(currentPassword, newPassword) {
  const res = await apiFetch("/user/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "Failed to change password");
  }
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

// ── NEW: Public Stream & Echoes ──
export async function getPublicStream() {
  const res = await apiFetch("/public/stream");
  if (!res.ok) return { echoes: [], total: 0 };
  return res.json();
}

export async function getPublicEchoes(username) {
  const res = await apiFetch(`/public/echoes/${username}`);
  if (!res.ok) return { echoes: [], total: 0 };
  return res.json();
}

// ── NEW: Blob Fetcher (For Images) ──
export async function fetchBlob(endpoint) {
  // Use apiFetch to handle auth headers automatically
  const res = await apiFetch(endpoint);
  if (!res.ok) throw new Error("Failed to fetch image");
  return res.blob();
}

// ── Reading Room ──
export async function getRoom() {
  const res = await apiFetch("/user/room");
  if (!res.ok) return { layout: null, unlocks: [], decorations: [] };
  return res.json();
}

export async function saveRoomLayout(shelves) {
  const res = await apiFetch("/user/room", {
    method: "PATCH",
    body: JSON.stringify({ shelves }),
  });
  return res.json();
}

export async function getPublicRoom(username) {
  const res = await apiFetch(`/public/${username}/room`);
  if (!res.ok) return { layout: null, entries: {} };
  return res.json();
}
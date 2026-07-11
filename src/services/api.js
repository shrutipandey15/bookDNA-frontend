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

// ── Token management (authCookieContract.md / B1.10 / P1-1) ──
// The access token lives in MEMORY ONLY — never localStorage. An XSS can read
// localStorage, so a refresh token stored there = account takeover. The refresh
// token instead lives in an httpOnly cookie the browser manages and JS cannot
// see; the worst an XSS can do is steal a 15-minute access token.
let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
}

// End the session locally: drop the in-memory token and wipe the per-account
// cache so the next user never sees the previous user's shelf. [F1.4 / P5-3]
// (The httpOnly cookie is cleared server-side by POST /auth/logout.)
export function clearSession() {
  accessToken = null;
  clearCache();
}

// One-time cutover: older builds stored tokens in localStorage. They're no longer
// valid; remove them so nothing stale lingers. [authCookieContract.md §Cutover]
try {
  localStorage.removeItem("bookdna_tokens");
} catch {
  // ignore — storage may be unavailable
}

// ── Single-flight token refresh ──
// A rotating refresh token can only be redeemed once. If several requests 401 at
// the same time and each POSTs /auth/refresh, all but the first redeem a stale
// token, the backend revokes the session, and the user is logged out at random.
// We funnel every concurrent refresh through one shared promise so exactly one
// /auth/refresh fires per stampede. [F1.1 / P2-11]
let refreshPromise = null;

async function doRefresh() {
  // Empty body — the httpOnly cookie IS the credential. Must send credentials so
  // the browser attaches the cookie.
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error("refresh_failed");
  const data = await res.json();
  setAccessToken(data.access_token);
  return data;
}

// Exposed so the app can attempt a silent login on boot (access token is gone
// from memory after a reload; the cookie survives). Single-flight guarded.
export function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ── Core fetch wrapper with auto-refresh ──
export async function apiFetch(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...opts.headers };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Handle blob responses (don't set Content-Type if body is FormData, etc.)
  if (opts.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "same-origin",
    ...opts,
    headers,
  });

  // Auto-refresh on 401 (single-flight; retry once with the fresh token).
  if (res.status === 401 && !opts._retried) {
    try {
      await refreshOnce();
    } catch {
      clearSession();
      return res;
    }
    return apiFetch(path, { ...opts, _retried: true });
  }

  return res;
}

// ── Auth ──
// login/register return { access_token, expires_in, user } and set the refresh
// cookie via Set-Cookie. No refresh token ever appears in the body.
export async function register(email, username, password, displayName) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      username,
      password,
      display_name: displayName || username,
    }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "Registration failed");
  }
  const data = await res.json();
  setAccessToken(data.access_token);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "Login failed");
  }
  const data = await res.json();
  setAccessToken(data.access_token);
  return data;
}

// Revoke server-side (clears the httpOnly cookie) then drop local state. Best
// effort — even if the network call fails, the local session is cleared.
export async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    // ignore — clear locally regardless
  }
  clearSession();
}

export async function getMe() {
  const res = await apiFetch("/auth/me");
  if (!res.ok) return null;
  return res.json();
}

// ── Entries ──
// One page of entries in keyset (cursor) mode — the preferred contract [B1.4].
// Pass `cursor` from the previous page's `next_cursor`; omit it for the first
// page. Returns { entries, total, next_cursor, has_more }. Throws ApiError on
// failure (incl. 400 for a malformed cursor) so an empty shelf is never confused
// with an error. [F1.2 / P5-2]
export async function getEntries({ cursor = null, limit = 100 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return apiGet(`/entries?${params.toString()}`);
}

// Walk the keyset cursor to the end and return the whole library. The shelf, DNA,
// stats and filters all work over the full set in memory; this also fixes the old
// per_page=100 truncation that hid books past the 100th. [F1.8 / B1.4]
// `maxPages` is a safety valve against a backend that never flips has_more.
export async function getAllEntries({ pageSize = 100, maxPages = 200 } = {}) {
  const all = [];
  let cursor = null;
  let total = 0;
  for (let i = 0; i < maxPages; i++) {
    const data = await getEntries({ cursor, limit: pageSize });
    all.push(...(data.entries || []));
    total = typeof data.total === "number" ? data.total : all.length;
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return { entries: all, total };
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
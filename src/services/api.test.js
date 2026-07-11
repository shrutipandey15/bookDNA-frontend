import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiFetch, saveTokens, clearTokens } from "./api";
import { setCachedEntries, getCachedEntries } from "./offline";

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe("apiFetch single-flight refresh [F1.1 / P2-11]", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    saveTokens({ access_token: "old", refresh_token: "r1" });
  });

  it("fires /auth/refresh exactly once when many requests 401 in parallel", async () => {
    let refreshCalls = 0;

    const fetchMock = vi.fn(async (url, opts) => {
      if (url.endsWith("/auth/refresh")) {
        refreshCalls += 1;
        // Simulate latency so all stampeding callers overlap.
        await new Promise((r) => setTimeout(r, 10));
        return jsonResponse({ access_token: "new", refresh_token: "r2" });
      }
      const auth = opts?.headers?.Authorization;
      // The stale access token 401s; the refreshed one succeeds.
      if (auth === "Bearer old") return jsonResponse({ detail: "expired" }, 401);
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const results = await Promise.all(
      Array.from({ length: 5 }, () => apiFetch("/entries")),
    );

    expect(refreshCalls).toBe(1);
    expect(results.every((r) => r.status === 200)).toBe(true);
    // Refreshed token is persisted for subsequent requests.
    expect(JSON.parse(localStorage.getItem("bookdna_tokens")).access_token).toBe("new");
  });

  it("clears tokens and does not loop when refresh fails", async () => {
    const fetchMock = vi.fn(async (url) => {
      if (url.endsWith("/auth/refresh")) return jsonResponse({ detail: "revoked" }, 401);
      return jsonResponse({ detail: "expired" }, 401);
    });
    vi.stubGlobal("fetch", fetchMock);
    // jsdom navigation is a no-op; guard so it doesn't throw.
    vi.stubGlobal("location", { href: "/" });

    const res = await apiFetch("/entries");
    expect(res.status).toBe(401);
    expect(localStorage.getItem("bookdna_tokens")).toBeNull();
  });
});

describe("clearTokens wipes per-account cache [F1.4 / P5-3]", () => {
  beforeEach(() => localStorage.clear());

  it("removes cached entries so the next user never sees them", () => {
    saveTokens({ access_token: "a", refresh_token: "b" });
    setCachedEntries([{ id: 1, title: "Previous user's book" }]);
    expect(getCachedEntries()).not.toBeNull();

    clearTokens();

    expect(getCachedEntries()).toBeNull();
    expect(localStorage.getItem("bookdna_tokens")).toBeNull();
  });
});

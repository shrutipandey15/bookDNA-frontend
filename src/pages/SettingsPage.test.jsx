import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the router + auth so we can render SettingsPage in isolation.
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { username: "alice" }, logout: vi.fn(), refreshUser: vi.fn() }),
}));

vi.mock("../services/api", () => ({
  getSettings: vi.fn().mockResolvedValue({ display_name: "Alice", profile_visibility: "private" }),
  updateSettings: vi.fn().mockResolvedValue({}),
  changePassword: vi.fn(),
  generateShareToken: vi.fn().mockResolvedValue({ share_token: "tok123", room_unlocks_new: [] }),
  revokeShareTokens: vi.fn().mockResolvedValue(undefined),
}));

import SettingsPage from "./SettingsPage";
import { updateSettings, generateShareToken, revokeShareTokens } from "../services/api";

async function openVisibility() {
  render(<SettingsPage />);
  await userEvent.click(screen.getByRole("button", { name: /Visibility/i }));
}

describe("SettingsPage visibility control [F2.8 / B2.1]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads and reflects the current profile_visibility", async () => {
    await openVisibility();
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: /Private/i })).toBeChecked(),
    );
  });

  it("writes profile_visibility (not is_public) when a new option is chosen", async () => {
    await openVisibility();
    await waitFor(() => screen.getByRole("radio", { name: /Community/i }));
    await userEvent.click(screen.getByRole("radio", { name: /Community/i }));
    expect(updateSettings).toHaveBeenCalledWith({ profile_visibility: "community" });
  });

  it("reverts the selection if the update fails", async () => {
    updateSettings.mockRejectedValueOnce(new Error("nope"));
    await openVisibility();
    await waitFor(() => screen.getByRole("radio", { name: /Public/i }));
    await userEvent.click(screen.getByRole("radio", { name: /Public/i }));
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: /Private/i })).toBeChecked(),
    );
  });

  it("mints a share link and can revoke", async () => {
    await openVisibility();
    await userEvent.click(screen.getByRole("button", { name: /Create a link/i }));
    expect(generateShareToken).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByLabelText("Your share link").value).toContain("/s/tok123"),
    );
    await userEvent.click(screen.getByRole("button", { name: /Revoke all links/i }));
    expect(revokeShareTokens).toHaveBeenCalled();
  });
});

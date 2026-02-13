import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  isAuthed as checkAuthed,
  clearTokens,
  getMe,
  login as apiLogin,
  register as apiRegister,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(checkAuthed());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount or when authed changes
  const loadUser = useCallback(async () => {
    if (!checkAuthed()) {
      setAuthed(false);
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const userData = await getMe();
      if (userData) {
        setUser(userData);
        setAuthed(true);
      } else {
        // Token invalid
        clearTokens();
        setAuthed(false);
        setUser(null);
      }
    } catch {
      clearTokens();
      setAuthed(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const tokens = await apiLogin(email, password);
    setAuthed(true);
    const userData = await getMe();
    if (userData) setUser(userData);
    return tokens;
  };

  const register = async (email, username, password, displayName) => {
    const userData = await apiRegister(email, username, password, displayName);
    return userData;
  };

  const logout = () => {
    clearTokens();
    setAuthed(false);
    setUser(null);
  };

  const refreshUser = async () => {
    const userData = await getMe();
    if (userData) setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        authed,
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
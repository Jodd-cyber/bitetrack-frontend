import { createContext, useContext, useEffect, useState } from "react";
import warmBackend from "../utils/warmBackend";
const AuthContext = createContext(null);
const STORAGE_KEY = "bitetrack_user";

const readStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const decodeJwtPayload = (token) => {
  const payload = token.split(".")[1] || "";
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(atob(padded));
};

const readAuthFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    return null;
  }

  try {
    const payload = decodeJwtPayload(token);
    const userData = {
      name: payload.name,
      email: payload.email,
      id: payload.userId,
    };

    localStorage.setItem("token", token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

    return userData;
  } catch (err) {
    console.error("OAuth URL bootstrap failed:", err);
    return null;
  }
};

const readInitialUser = () => readStoredUser() || readAuthFromUrl();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readInitialUser());
  // load user from localStorage on first app load
useEffect(() => {
  warmBackend();

  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const storedUser =
      localStorage.getItem(STORAGE_KEY) ||
      sessionStorage.getItem(STORAGE_KEY);

    if (!token || !storedUser) {
      setUser(null);
      return;
    }

    setUser(JSON.parse(storedUser));
  } catch (err) {
    console.error("Auth restore failed:", err);
    setUser(null);
  }
}, []);
  // login can be called with either a user object or (email, password)
const login = (userData, token, rememberMe = true) => {
  if (!userData || !token) return;

  setUser(userData);

  // clear everything first
  localStorage.removeItem("token");
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem("token");
  sessionStorage.removeItem(STORAGE_KEY);

  if (rememberMe) {
    localStorage.setItem("token", token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } else {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }
};
  // ADD SIGNUP FUNCTION
  const signup = (name, email, password) => {
    // Create user data object
    const userData = {
      name: name || email.split('@')[0],
      email: email
    };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };
  const logout = () => {
  setUser(null);

  localStorage.removeItem("token");
  localStorage.removeItem(STORAGE_KEY);

  sessionStorage.removeItem("token");
  sessionStorage.removeItem(STORAGE_KEY);
};
  const isSignedIn = Boolean(user);
  return (
    <AuthContext.Provider value={{ user, isSignedIn, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
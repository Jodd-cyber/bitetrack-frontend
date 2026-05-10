import { createContext, useContext, useEffect, useState } from "react";
import warmBackend from "../utils/warmBackend";

const AuthContext = createContext(null);
const STORAGE_KEY = "bitetrack_user";

const readStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ ADD THIS

  useEffect(() => {
    console.log("🔵 AuthProvider mounting - checking stored auth...");
    warmBackend();

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedUser = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);

      console.log("Token exists:", !!token);
      console.log("User exists:", !!storedUser);

      if (token && storedUser) {
        console.log("✅ Restoring user from storage");
        setUser(JSON.parse(storedUser));
      } else {
        console.log("❌ No stored auth found");
        setUser(null);
      }
    } catch (err) {
      console.error("Auth restore failed:", err);
      setUser(null);
    } finally {
      setIsLoading(false); // ✅ Mark as loaded
    }
  }, []);

  const login = (userData, token, rememberMe = true) => {
    console.log("🟢 login() called");

    if (!userData || !token) {
      console.error("❌ Missing userData or token");
      return;
    }

    setUser(userData);

    localStorage.removeItem("token");
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem(STORAGE_KEY);

    if (rememberMe) {
      localStorage.setItem("token", token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      console.log("✅ Saved to localStorage");
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      console.log("✅ Saved to sessionStorage");
    }
  };

  const signup = (name, email, password) => {
    const userData = {
      name: name || email.split('@')[0],
      email: email
    };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    console.log("🔴 logout() called");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const isSignedIn = Boolean(user);
  
  console.log("📊 AuthContext state:", { user: user?.email, isSignedIn, isLoading });

  return (
    <AuthContext.Provider value={{ user, isSignedIn, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
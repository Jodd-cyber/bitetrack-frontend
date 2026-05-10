import { createContext, useContext, useEffect, useState } from "react";
import warmBackend from "../utils/warmBackend";

const AuthContext = createContext(null);
const STORAGE_KEY = "bitetrack_user";

const readStoredUser = () => {
  const raw =
    localStorage.getItem(STORAGE_KEY) ||
    sessionStorage.getItem(STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  // ✅ Read from localStorage IMMEDIATELY on first render
  const [user, setUser] = useState(() => {
    console.log("🔵 AuthProvider initializing from localStorage...");
    const storedUser = readStoredUser();
    console.log("Stored user:", storedUser?.email || "none");
    return storedUser;
  });

  const [isLoading, setIsLoading] = useState(false); // ✅ Start as false since we already loaded

  useEffect(() => {
    console.log("🔵 AuthProvider useEffect running");
    warmBackend();

    // Verify token exists if user exists
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (user && !token) {
      console.warn("⚠️ User exists but no token - clearing user");
      setUser(null);
    }
  }, [user]);

  const login = (userData, token, rememberMe = true) => {
    console.log("🟢 login() called with:", userData.email);

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
  
  console.log("📊 AuthContext state:", { 
    email: user?.email, 
    isSignedIn, 
    isLoading 
  });

  return (
    <AuthContext.Provider value={{ user, isSignedIn, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
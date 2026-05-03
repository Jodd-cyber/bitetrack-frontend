import { createContext, useContext, useEffect, useState } from "react";
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // load user from localStorage on first app load
  useEffect(() => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const storedUser = readStoredUser();

  if (token && storedUser) {
    setUser(storedUser);
  }
}, []);
  // login can be called with either a user object or (email, password)
  const login = (userData, token, rememberMe = true) => {
  if (!userData || !token) return;

  setUser(userData);

  // Save user always
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

  // Save token based on rememberMe
  if (rememberMe) {
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("token", token);
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
    localStorage.removeItem(STORAGE_KEY);
localStorage.removeItem("token");
sessionStorage.removeItem("token");
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
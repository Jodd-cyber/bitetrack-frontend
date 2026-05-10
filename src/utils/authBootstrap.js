const STORAGE_KEY = "bitetrack_user";

const decodeJwtPayload = (token) => {
  const payload = token.split(".")[1] || "";
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(atob(padded));
};

const bootstrapAuthFromUrl = () => {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    return;
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
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (err) {
    console.error("Pre-render OAuth bootstrap failed:", err);
  }
};

export default bootstrapAuthFromUrl;
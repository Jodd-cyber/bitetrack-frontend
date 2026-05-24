const getApiBase = () => {
  // If we are actually on a live production URL, ignore the local VITE_API_BASE
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://bitetrack-backend-yfkf.onrender.com";
  }
  return import.meta.env.VITE_API_BASE || "https://bitetrack-backend-yfkf.onrender.com";
};

export default getApiBase;

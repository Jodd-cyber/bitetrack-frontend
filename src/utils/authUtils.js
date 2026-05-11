import getApiBase from "./apiBase";

/**
 * Pings the backend to ensure it's awake before redirecting for OAuth.
 * This prevents the user from seeing the Render "Service Waking Up" page.
 */
export const wakeUpAndRedirect = async (url, setRedirecting) => {
  const API_BASE = getApiBase();
  setRedirecting(true);

  try {
    // Ping the backend. Render will keep this request pending until the service wakes up.
    // We use a simple fetch to the base URL or a health check if it exists.
    await fetch(`${API_BASE}/api/health`).catch(() => {
      // If /api/health fails (e.g. 404), try the base URL as fallback
      return fetch(`${API_BASE}/`);
    });
  } catch (error) {
    console.warn("Wake up ping failed, redirecting anyway...", error);
  }

  // Once the fetch completes (meaning backend is awake), redirect
  window.location.assign(url);
};

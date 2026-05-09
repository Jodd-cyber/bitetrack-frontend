import getApiBase from "./apiBase";

const warmBackend = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 1500);

    await fetch(`${getApiBase()}/health`, {
      method: "GET",
      signal: controller.signal,
      credentials: "omit",
    });

    window.clearTimeout(timeoutId);
  } catch {
    // Ignore warm-up failures; OAuth can still proceed.
  }
};

export default warmBackend;
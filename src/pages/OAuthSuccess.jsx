import { useEffect, useRef } from "react";

const OAuthSuccess = () => {
  const hasProcessedToken = useRef(false);

  const decodeJwtPayload = (token) => {
    const payload = token.split(".")[1] || "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  };

  useEffect(() => {
    if (hasProcessedToken.current) return;
    hasProcessedToken.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    console.log("🟡 OAuthSuccess: token =", !!token, "error =", error);

    // Handle backend errors
    if (error) {
      console.error("❌ OAuth Error:", error);
      window.location.href = `/signin?error=${error}`;
      return;
    }

    // Handle success
    if (token) {
      try {
        console.log("✅ Processing token...");

        // Decode JWT to get user info
        const payload = decodeJwtPayload(token);
        console.log("✅ Decoded payload:", payload);

        // Store token and user data directly to localStorage
        // so when the page reloads, AuthProvider picks them up immediately
        localStorage.setItem("token", token);
        localStorage.setItem(
          "bitetrack_user",
          JSON.stringify({
            name: payload.name,
            email: payload.email,
            id: payload.userId,
          })
        );

        console.log("✅ Token and user stored in localStorage");

        // Full page redirect to home — AuthProvider will read from localStorage on load
        console.log("🟢 Redirecting to home...");
        window.location.href = "/";
      } catch (err) {
        console.error("❌ Failed to process OAuth token:", err);
        window.location.href = `/signin?error=invalid_token`;
      }
    } else {
      console.log("❌ No token found");
      window.location.href = "/signin";
    }
  }, []);

  // Show loading while processing
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column"
    }}>
      <p>✨ Completing sign in...</p>
      <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>Please wait...</p>
    </div>
  );
};

export default OAuthSuccess;
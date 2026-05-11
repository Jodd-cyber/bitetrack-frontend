import { useEffect, useRef } from "react";

const OAuthSuccess = () => {
  const hasProcessedToken = useRef(false);

  useEffect(() => {
    if (hasProcessedToken.current) return;
    hasProcessedToken.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const userId = params.get("userId");
    const error = params.get("error");

    console.log("🟡 OAuthSuccess: token =", !!token, "name =", name, "email =", email, "error =", error);

    // Handle backend errors
    if (error) {
      console.error("❌ OAuth Error:", error);
      window.location.href = `/signin?error=${error}`;
      return;
    }

    // Handle success
    if (token && name && email) {
      console.log("✅ Storing auth data from URL params...");

      // Store token and user data directly to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem(
        "bitetrack_user",
        JSON.stringify({
          name: name,
          email: email,
          id: userId,
        })
      );

      console.log("✅ Token and user stored in localStorage");
      console.log("🟢 Redirecting to home...");

      // Full page redirect — AuthProvider will read from localStorage on load
      window.location.href = "/";
    } else if (token) {
      // Fallback: token exists but no user params — try to decode JWT
      try {
        console.log("⚠️ No user params in URL, attempting JWT decode...");
        const payloadPart = token.split(".")[1] || "";
        const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
        const payload = JSON.parse(atob(padded));

        localStorage.setItem("token", token);
        localStorage.setItem(
          "bitetrack_user",
          JSON.stringify({
            name: payload.name || "",
            email: payload.email || "",
            id: payload.userId || "",
          })
        );

        console.log("✅ Fallback JWT decode succeeded");
        window.location.href = "/";
      } catch (err) {
        console.error("❌ JWT decode failed:", err);
        // Last resort: just store the token and go home
        // AuthProvider will see the token exists but no user — 
        // let the app handle it
        localStorage.setItem("token", token);
        localStorage.setItem(
          "bitetrack_user",
          JSON.stringify({ name: "User", email: "", id: "" })
        );
        window.location.href = "/";
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
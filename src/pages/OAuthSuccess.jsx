import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
  const { login, isSignedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const hasProcessedToken = useRef(false);

  const decodeJwtPayload = (token) => {
    const payload = token.split(".")[1] || "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  };

  // Step 1: Process the token from URL and call login()
  useEffect(() => {
    if (hasProcessedToken.current) return;

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
        hasProcessedToken.current = true;
        console.log("✅ Processing token...");

        // Decode JWT to get user info
        const payload = decodeJwtPayload(token);
        console.log("✅ Decoded payload:", payload);

        // Call login to update auth context (this also stores to localStorage)
        login(
          {
            name: payload.name,
            email: payload.email,
            id: payload.userId,
          },
          token,
          true
        );

        console.log("✅ Auth context updated, waiting for state to propagate...");
      } catch (err) {
        console.error("❌ Failed to process OAuth token:", err);
        window.location.href = `/signin?error=invalid_token`;
      }
    } else {
      console.log("❌ No token found");
      window.location.href = "/signin";
    }
  }, [login]);

  // Step 2: Navigate to home ONLY after auth state confirms sign-in
  useEffect(() => {
    if (hasProcessedToken.current && !isLoading && isSignedIn) {
      console.log("🟢 Auth state confirmed, redirecting to home...");
      navigate("/", { replace: true });
    }
  }, [isSignedIn, isLoading, navigate]);

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
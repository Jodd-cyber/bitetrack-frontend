import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login, isSignedIn } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  const decodeJwtPayload = (token) => {
    const payload = token.split(".")[1] || "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    // Handle backend errors
    if (error) {
      console.error("OAuth Error:", error);
      navigate(`/signin?error=${error}`, { replace: true });
      return;
    }

    // Handle success
    if (token) {
      try {
        // Store token
        localStorage.setItem("token", token);

        // Decode JWT to get user info
        const payload = decodeJwtPayload(token);

        // Update auth context
        login(
          {
            name: payload.name,
            email: payload.email,
            id: payload.userId,
          },
          token,
          true // rememberMe = true
        );

        // ✅ Wait for auth state to update, then redirect
        setIsProcessing(false);
        navigate("/", { replace: true });
      } catch (err) {
        console.error("❌ Failed to process OAuth token:", err);
        navigate(`/signin?error=invalid_token`, { replace: true });
      }
    } else {
      // No token and no error
      navigate("/signin", { replace: true });
    }
  }, [navigate, login]);

  // Show loading while processing
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh" 
    }}>
      <p>Completing sign in...</p>
    </div>
  );
};

export default OAuthSuccess;
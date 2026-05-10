import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    // Handle backend errors
    if (error) {
      console.error("OAuth Error:", error);
      navigate(`/signin?error=${error}`);
      return;
    }

    // Handle success
    if (token) {
      try {
        // Store token
        localStorage.setItem("token", token);

        // Decode JWT to get user info
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Update auth context
        login(
          {
            name: payload.name,
            email: payload.email,
            id: payload.userId,
          },
          token
        );

        // Redirect to home
        navigate("/", { replace: true });
      } catch (err) {
        console.error("❌ Failed to process OAuth token:", err);
        navigate("/signin?error=invalid_token");
      }
    } else {
      // No token and no error — shouldn't happen
      navigate("/signin");
    }
  }, [navigate, login]);

  // Show nothing while processing
  return null;
};

export default OAuthSuccess;
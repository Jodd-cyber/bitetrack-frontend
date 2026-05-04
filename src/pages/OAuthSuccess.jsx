import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ add this

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ get login function

  useEffect(() => {
    // 1. Get token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // 2. Save token
      localStorage.setItem("token", token);

      // 3. OPTIONAL (better): decode token to get user info
      const payload = JSON.parse(atob(token.split(".")[1]));

      // 4. Update auth context (IMPORTANT)
      login(
        {
          name: payload.name,
          email: payload.email,
          id: payload.userId,
        },
        token
      );

      // 5. Redirect to home
      navigate("/");
    } else {
      navigate("/signin");
    }
  }, [navigate, login]);

  return <div>Logging you in...</div>;
};

export default OAuthSuccess;
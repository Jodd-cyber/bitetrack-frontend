import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // ✅ FIRST get token
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("TOKEN:", token);   // debug

    if (token) {
      localStorage.setItem("token", token);

      // ✅ THEN decode
      const decoded = jwtDecode(token);
      console.log("DECODED:", decoded);

      login(
  {
    name: decoded.name || "Google User",
    email: decoded.email,
    id: decoded.userId,
  },
  token,
  true // OAuth = always remember
);

      navigate("/");
    }
  }, []);

  return <div>Logging you in...</div>;
};

export default OAuthSuccess;

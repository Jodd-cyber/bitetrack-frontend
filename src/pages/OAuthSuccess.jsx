import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ add this

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ get login function

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);

    const payload = JSON.parse(atob(token.split(".")[1]));

    login(
      {
        name: payload.name,
        email: payload.email,
        id: payload.userId,
      },
      token
    );

    // 🔥 wait for auth state to update
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 200);

  } else {
    navigate("/signin");
  }
}, []);

return null;
};

export default OAuthSuccess;
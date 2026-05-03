import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // ✅ ADD THIS
import { parseApiResponse } from "../utils/apiResponse";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://bitetrack-backend-yfkf.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await parseApiResponse(res);

      alert(data.message);

      if (res.ok) {
        setTimeout(() => {
          navigate("/signin");
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong ❌");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen flex items-center justify-center"
    >
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4"
          required
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Send Reset Link
        </button>
      </form>
    </motion.div>
  );
}

export default ForgotPassword;
import { useState } from "react";
import { useParams } from "react-router-dom";
import { parseApiResponse } from "../utils/apiResponse";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(
      `https://bitetrack-backend-yfkf.onrender.com/api/auth/reset-password/${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );

    const data = await parseApiResponse(res);
    alert(data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow"
      >
        <h2 className="text-xl font-bold mb-4">Set New Password</h2>

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4"
          required
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Update Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
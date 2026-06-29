import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { parseApiResponse } from "../utils/apiResponse";
import getApiBase from "../utils/apiBase";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const API_BASE = getApiBase();
      const res = await fetch(
        `${API_BASE}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await parseApiResponse(res);
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to reset password. The link might be invalid or expired.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-4">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f172a]/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        {success ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full items-center justify-center mx-auto mb-6 flex border border-emerald-500/20">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-white text-2xl font-black mb-3">Password Updated! 🎉</h2>
            <p className="text-slate-400 text-sm mb-8 leading-6">
              Your password has been successfully updated. The reset link is now closed and deactivated for security. You can now log back into the app!
            </p>
            <button
              onClick={() => navigate("/signin")}
              className="w-full bg-emerald-500 text-slate-950 font-extrabold py-4 rounded-2xl shadow-lg shadow-emerald-500/10 hover:bg-emerald-400 transition-all uppercase tracking-wider text-xs"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full items-center justify-center mx-auto mb-4 flex border border-emerald-500/20">
                <span className="text-3xl">🔑</span>
              </div>
              <h2 className="text-white text-2xl font-black mb-2">Set New Password</h2>
              <p className="text-slate-400 text-xs px-4">
                Please enter a secure password. Minimum 6 characters.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center text-red-400 text-xs">
                <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-semibold leading-5">{error}</span>
              </div>
            )}

            {/* Password input container */}
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-semibold ml-1">
                New Password
              </label>
              <div className="relative flex items-center bg-[#090d16] border border-slate-800 rounded-2xl px-4 py-3.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <svg className="text-slate-500 w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm outline-none border-none pr-10"
                  required
                  disabled={isSubmitting}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-500 hover:text-slate-350 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 text-slate-950 font-extrabold py-4 rounded-2xl shadow-lg shadow-emerald-500/10 hover:bg-emerald-400 transition-all uppercase tracking-wider text-xs flex justify-center items-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
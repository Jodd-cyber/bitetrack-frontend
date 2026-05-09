import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { parseApiResponse } from "../utils/apiResponse";
import getApiBase from "../utils/apiBase";
import warmBackend from "../utils/warmBackend";

function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
const [showPassword, setShowPassword] = useState(false);

  const handleOAuthRedirect = async (url) => {
    if (isSubmitting || isRedirecting) return;

    setIsRedirecting(true);

    await warmBackend();
    window.location.replace(url);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const API_BASE = getApiBase();

    try {
      const payload = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };

        const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await parseApiResponse(response);
      if (!response.ok) {
        console.error('Login error:', response.status, data);
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      login(
  { name: data.user.name, email: data.user.email, id: data.user.id },
  data.token,
  rememberMe
);
      navigate("/");

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Home Button */}
          <div className="mb-6 animate-fade-in">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Logo and Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-6 cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                B
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                BiteTrack
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to track your food orders</p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 animate-slide-up">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Password
  </label>

  <div className="relative">

    {/* 🔑 Password Input */}
    <input
      type={showPassword ? "text" : "password"}
      value={formData.password}
      onChange={(e) =>
        setFormData({ ...formData, password: e.target.value })
      }
      required
      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
      placeholder="••••••••"
    />

    {/* 👁️ Eye Button */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-900"
    >
      {showPassword ? (
        // Hide icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-7-10-7a19.805 19.805 0 013.362-4.362M6.223 6.223A9.953 9.953 0 0112 5c5.523 0 10 7 10 7a19.815 19.815 0 01-4.293 5.293M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6L3 3" />
        </svg>
      ) : (
        // Show icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.458 4.458A9.969 9.969 0 0112 17c-5.523 0-10-5-10-5s4.477-5 10-5 10 5 10 5a9.969 9.969 0 01-2.542 4.458z" />
        </svg>
      )}
    </button>

  </div>
</div>

    <button
    type="button"
      onClick={() => handleOAuthRedirect(`${getApiBase()}/api/auth/google`)}
      disabled={isSubmitting || isRedirecting}
  className="w-full border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
>
  <img
    src="https://www.svgrepo.com/show/475656/google-color.svg"
    alt="Google"
    className="w-5 h-5"
  />
  Continue with Google
</button>


    <button
    type="button"
      onClick={() => handleOAuthRedirect(`${getApiBase()}/api/auth/github`)}
      disabled={isSubmitting || isRedirecting}
  className="w-full border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
>
  <img
    src="https://www.svgrepo.com/show/512317/github-142.svg"
    alt="GitHub"
    className="w-5 h-5"
  />
  Continue with GitHub
</button>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
  checked={rememberMe}
  onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
  onClick={() => navigate("/forgot-password")}
  className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors relative group"
                >
                  Forgot password?
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full bg-gray-900 text-white py-3 rounded-xl font-medium shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-gray-900"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? "Signing in..." : "Sign in"}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-gray-900 hover:text-gray-600 transition-colors relative group"
              >
                Sign up
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </p>
          </div>

          {/* Footer — buttons now open modals */}
          <p className="mt-8 text-center text-xs text-gray-500 animate-fade-in-delay">
            By signing in, you agree to our{' '}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="hover:text-gray-900 transition-colors underline"
            >
              Terms
            </button>
            {' '}and{' '}
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="hover:text-gray-900 transition-colors underline"
            >
              Privacy Policy
            </button>
          </p>

        </div>
      </div>

      {(isSubmitting || isRedirecting) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-md px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white shadow-2xl p-8 text-center"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg">
              <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeOpacity="0.2" strokeWidth="2"></circle>
                <path d="M21 12a9 9 0 0 0-9-9" strokeWidth="2" strokeLinecap="round"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Getting you signed in</h3>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we connect your account.
            </p>
          </motion.div>
        </div>
      )}

      {/* ── Terms Modal ── */}
      {showTerms && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={() => setShowTerms(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[90%] max-w-lg rounded-2xl shadow-2xl relative overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  B
                </div>
                <h2 className="text-lg font-bold text-gray-900">Terms & Conditions</h2>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors text-lg font-medium"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">1. Acceptance of Terms</h3>
                <p>By creating an account and using BiteTrack, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our service.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">2. Use of Service</h3>
                <p>You agree to use BiteTrack responsibly and only for lawful purposes. You must not misuse the platform or attempt to disrupt its normal operation.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">3. Account Responsibility</h3>
                <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">4. Data Storage</h3>
                <p>Your data is stored securely on our servers. We take reasonable precautions to protect your information from unauthorized access.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">5. Modifications</h3>
                <p>We reserve the right to modify these terms at any time. Continued use of BiteTrack after changes constitutes acceptance of the new terms.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">6. Termination</h3>
                <p>We reserve the right to suspend or terminate your account if you violate these terms or engage in any behavior harmful to the platform or other users.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Privacy Modal ── */}
      {showPrivacy && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={() => setShowPrivacy(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[90%] max-w-lg rounded-2xl shadow-2xl relative overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  B
                </div>
                <h2 className="text-lg font-bold text-gray-900">Privacy Policy</h2>
              </div>
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors text-lg font-medium"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">1. Information We Collect</h3>
                <p>We collect minimal data necessary to provide our service, including your name, email address, and food order tracking information you choose to enter.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">2. How We Use Your Data</h3>
                <p>Your data is used solely to provide and improve the BiteTrack service. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">3. Data Security</h3>
                <p>We implement industry-standard security measures including encryption to protect your data from unauthorized access, disclosure, or alteration.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">4. Cookies</h3>
                <p>We use cookies and similar technologies to maintain your session and improve your experience. You can control cookie settings through your browser.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">5. Your Rights</h3>
                <p>You have the right to access, correct, or delete your personal data at any time. You can request deletion of your account and all associated data by contacting us.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">6. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at privacy@bitetrack.com.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default SignIn;
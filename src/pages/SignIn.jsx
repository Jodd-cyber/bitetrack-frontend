import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { parseApiResponse } from "../utils/apiResponse";
import getApiBase from "../utils/apiBase";
import "../auth.css";

function SignIn() {
  const navigate = useNavigate();
 const { login, isSignedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
const [showPassword, setShowPassword] = useState(false);

  // ✅ Auto-redirect if already signed in (e.g. after OAuth stored token)
  useEffect(() => {
    const hasToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    const hasUser = localStorage.getItem("bitetrack_user") || sessionStorage.getItem("bitetrack_user");
    if (isSignedIn || (hasToken && hasUser)) {
      navigate("/", { replace: true });
    }
  }, [isSignedIn, navigate]);


  const handleOAuthRedirect = async (url) => {
    if (isSubmitting || isRedirecting) return;

    setIsRedirecting(true);
    window.location.assign(url);
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
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          <form onSubmit={handleSubmit} className="form">
            <p id="heading">Login</p>

            {error && (
              <div style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '10px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div className="field">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
              </svg>
              <input 
                autoComplete="off" 
                placeholder="Email" 
                className="input-field" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
              </svg>
              <input 
                placeholder="Password" 
                className="input-field" 
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#d3d3d3', cursor: 'pointer', padding: '0 5px' }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#d3d3d3', fontSize: '13px', marginTop: '10px' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label>Remember me</label>
            </div>

            <div className="btn">
              <button className="button1" type="submit" disabled={isSubmitting}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{isSubmitting ? "Wait..." : "Login"}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </button>
              <button className="button2" type="button" onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </div>

            <button className="button3" type="button" onClick={() => navigate("/forgot-password")}>
              Forgot Password
            </button>

            {/* Social Logins */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '-20px', paddingBottom: '20px' }}>
              <button
                type="button"
                onClick={() => handleOAuthRedirect(`${getApiBase()}/api/auth/google`)}
                disabled={isSubmitting || isRedirecting}
                style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '10px', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#252525', color: 'white', cursor: 'pointer', transition: '.4s ease-in-out' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'black'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#252525'}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthRedirect(`${getApiBase()}/api/auth/github`)}
                disabled={isSubmitting || isRedirecting}
                style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '10px', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#252525', color: 'white', cursor: 'pointer', transition: '.4s ease-in-out' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'black'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#252525'}
              >
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" style={{ width: '20px', height: '20px', filter: 'invert(1)' }} />
                Continue with GitHub
              </button>
            </div>

          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center text-xs text-gray-500 space-y-3">
            <p>
              By signing in, you agree to our{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="hover:text-gray-300 transition-colors underline"
              >
                Terms
              </button>
              {' '}and{' '}
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="hover:text-gray-300 transition-colors underline"
              >
                Privacy Policy
              </button>
            </p>
            <div>
              <Link
                to="/"
                className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <span>←</span> Back to Home
              </Link>
            </div>
          </div>

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
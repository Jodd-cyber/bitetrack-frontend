import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { parseApiResponse } from "../utils/apiResponse";
import getApiBase from "../utils/apiBase";
import "../auth.css";
import { wakeUpAndRedirect } from "../utils/authUtils";
import Loader from "../components/Loader";

function SignUp() {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    document.title = "Sign Up | BiteTrack";
  }, []);

  const handleOAuthRedirect = async (url) => {
    if (isSubmitting || isRedirecting) return;
    await wakeUpAndRedirect(url, setIsRedirecting);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsSubmitting(true);
    const API_BASE = getApiBase();
    try {
        const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.message || 'Signup failed');
      
      if (data.token) {
        login(data.user, data.token);
      } else {
        signup(data.user.name, data.user.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
      >
        <div className="auth-container">
          <div className="card">
            <div className="card2">

            <form onSubmit={handleSubmit} className="form">
              <p id="heading">Sign Up</p>

              {error && (
                <div style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '10px', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div className="field">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                </svg>
                <input 
                  autoComplete="off" 
                  placeholder="Full name" 
                  className="input-field" 
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="field">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
                </svg>
                <input 
                  autoComplete="off" 
                  placeholder="Email address" 
                  className="input-field" 
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="field">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
                </svg>
                <input 
                  placeholder="Password" 
                  className="input-field" 
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              {/* Confirm Password Field */}
              <div className="field">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
                </svg>
                <input 
                  placeholder="Confirm password" 
                  className="input-field" 
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </div>

              {/* Terms Checkbox */}
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  required
                />
                <span className="checkmark"></span>
                <span>
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Terms
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>

              <div className="btn" style={{ width: '100%' }}>
                <button className="button1" type="submit" disabled={isSubmitting} style={{ width: '100%', marginBottom: '10px' }}>
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </div>

              {/* Social Logins */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                     window.location.assign(`${getApiBase()}/api/auth/google`);
                  }}
                  disabled={isSubmitting}
                  className="social-btn"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                  Sign up with Google
                </button>

                <button
                  type="button"
                  onClick={() => {
                     window.location.assign(`${getApiBase()}/api/auth/github`);
                  }}
                  disabled={isSubmitting}
                  className="social-btn"
                >
                  <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="dark:invert-0" style={{ width: '20px', height: '20px', filter: 'var(--github-icon-filter, invert(1))' }} />
                  Sign up with GitHub
                </button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="footer-links">
              <p>
                Already have an account?{' '}
                <Link
                  to="/signin"
                >
                  Sign in
                </Link>
              </p>
              <div>
                <Link
                  to="/"
                  className="back-link"
                >
                  <span>←</span> Back to Home
                </Link>
              </div>
            </div>

            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Terms Modal ── */}
      {showTerms && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={() => setShowTerms(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
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
              <button onClick={() => setShowTerms(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors text-lg font-medium">✕</button>
            </div>
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-gray-600">
              <div><h3 className="font-semibold text-gray-900 mb-1">1. Acceptance of Terms</h3><p>By creating an account and using BiteTrack, you agree to be bound by these Terms & Conditions.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">2. Use of Service</h3><p>You agree to use BiteTrack responsibly and only for lawful purposes.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">3. Account Responsibility</h3><p>You are responsible for maintaining the confidentiality of your account credentials.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">4. Data Storage</h3><p>Your data is stored securely on our servers.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">5. Modifications</h3><p>We reserve the right to modify these terms at any time.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">6. Termination</h3><p>We reserve the right to suspend or terminate your account if you violate these terms.</p></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowTerms(false)} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">Got it</button>
            </div>
          </motion.div>
        </div>
      )}

      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowPrivacy(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()} className="bg-white w-[90%] max-w-lg rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white text-sm font-bold">B</div>
                <h2 className="text-lg font-bold text-gray-900">Privacy Policy</h2>
              </div>
              <button onClick={() => setShowPrivacy(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors text-lg font-medium">✕</button>
            </div>
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-gray-600">
              <div><h3 className="font-semibold text-gray-900 mb-1">1. Information We Collect</h3><p>We collect minimal data necessary to provide our service.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">2. How We Use Your Data</h3><p>Your data is used solely to provide and improve the BiteTrack service.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">3. Data Security</h3><p>We implement industry-standard security measures including encryption.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">4. Cookies</h3><p>We use cookies to maintain your session.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">5. Your Rights</h3><p>You have the right to access, correct, or delete your personal data.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">6. Contact Us</h3><p>Contact us at privacy@bitetrack.com.</p></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowPrivacy(false)} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">Got it</button>
            </div>
          </motion.div>
        </div>
      )}

      {(isSubmitting || isRedirecting) && (
        <Loader text={isRedirecting ? "Connecting your account..." : "Setting up your account..."} />
      )}
    </>
  );
}

export { SignUp as default };
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseApiResponse } from "../utils/apiResponse";
import getApiBase from "../utils/apiBase";

function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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
      signup(data.user.name, data.user.email, form.password);
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-600">Start tracking your food orders today</p>
            </div>

            {/* Sign Up Form */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 animate-slide-up">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Full Name Field */}
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

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
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Must be at least 8 characters</p>
                </div>

                {/* Confirm Password Field */}
                <div className="group">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="confirm-password"
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="underline hover:text-gray-900 transition-colors"
                    >
                      Terms
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacy(true)}
                      className="underline hover:text-gray-900 transition-colors"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full bg-gray-900 text-white py-3 rounded-xl font-medium shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? 'Creating account...' : 'Create account'}
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
                  <span className="px-4 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              {/* Social Sign Up Buttons */}

              {/* Sign In Link */}
              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  className="font-medium text-gray-900 hover:text-gray-600 transition-colors relative group"
                >
                  Sign in
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </p>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-gray-500 animate-fade-in-delay">
              By creating an account, you agree to our{' '}
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

export { SignUp as default };
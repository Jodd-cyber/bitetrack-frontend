import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";




function App() {
  const [showWarning, setShowWarning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showBudgetSuccess, setShowBudgetSuccess] = useState(false);
  const { isSignedIn, user, login, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [monthlyBudget, setMonthlyBudget] = useState("");
const [stats, setStats] = useState({
  totalOrders: 0,
  totalSpent: 0,
  avgSpend: 0,
  topRestaurant: "-"
});

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);

    const decoded = jwtDecode(token);
    login(
      {
        name: decoded.name || "Google User",
        email: decoded.email,
        id: decoded.userId,
      },
      token,
      true
    );

    window.history.replaceState({}, document.title, "/");
  }
}, [login]);

  const handleSaveBudget = async () => {
  if (!monthlyBudget || monthlyBudget <= 0) {
    alert("Please enter a valid budget amount");
    return;
  }

  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    await fetch("https://bitetrack-backend-yfkf.onrender.com/api/user/budget", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ monthlyBudget })
    });

    // ✅ KEEP ONLY ONCE INSIDE FUNCTION
    setShowBudgetSuccess(true);
    setMonthlyBudget("");
    setTimeout(() => setShowBudgetSuccess(false), 3000);

  } catch (err) {
    console.error("Budget save error:", err);
  }
};
    

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 1000;
        oscillator2.type = 'sine';
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.1);
      }, 100);
    } catch (error) {
      console.log('Audio not supported');
    }
  };
  const handleGetStarted = () => {
    if (!isSignedIn) {
      playNotificationSound();
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
    } else {
      // Navigate directly to ledger if signed in
      navigate('/ledger');
    }
  };
  const handleLogout = () => {
    logout();
    setShowSettings(false);
  };

  // 👇 PASTE HERE (below handleLogout)
useEffect(() => {
  if (!showStats) return;

  const fetchStats = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const res = await fetch(
        "https://bitetrack-backend-yfkf.onrender.com/api/foodlogs",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      const totalOrders = data.length;

      const totalSpent = data.reduce(
        (sum, item) => sum + (item.items?.reduce((s, i) => s + i.calories, 0) || 0),
        0
      );

      const avgSpend = totalOrders
        ? Math.round(totalSpent / totalOrders)
        : 0;

      const restaurantSpend = {};
      data.forEach((item) => {
        if (item.restaurant) {
          const spend = item.items?.reduce((s, i) => s + i.calories, 0) || 0;
          restaurantSpend[item.restaurant] =
            (restaurantSpend[item.restaurant] || 0) + spend;
        }
      });

      const topRestaurant =
        Object.keys(restaurantSpend).length > 0
          ? Object.keys(restaurantSpend).reduce((a, b) =>
              restaurantSpend[a] > restaurantSpend[b] ? a : b
            )
          : "-";

      setStats({
        totalOrders,
        totalSpent,
        avgSpend,
        topRestaurant
      });

    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  fetchStats();
}, [showStats]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      {/* Warning Modal */}
      {showBudgetSuccess && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-fade-in">
          <div 
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
            onClick={() => setShowBudgetSuccess(false)}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Budget saved!</h3>
                <p className="text-gray-600 text-sm">
                  Your monthly budget of ₹{monthlyBudget} has been set. Check your Ledger to track spending.
                </p>
              </div>
              
              <button
                onClick={() => setShowBudgetSuccess(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
            onClick={() => setShowWarning(false)}
          ></div>
          
          {/* Warning Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-start gap-4">
              {/* Warning Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Sign in required</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Please sign in or create an account to start tracking your food orders.
                </p>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link
                    to="/signin"
                    className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowWarning(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-[var(--app-bg)] overflow-hidden">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[var(--app-surface)]/80 backdrop-blur-xl z-40 border-b border-gray-100 animate-slide-down">
            <Link to="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                B
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                BiteTrack
              </h1>
            </Link>
            <nav className="flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors relative group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
              </a>
              
              {/* Conditional Navigation - Show Ledger button if signed in */}
              {isSignedIn ? (
                <>
                  <Link
                    to="/ledger"
                    className="text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    📊 My Ledger
                  </Link>
                  
                  {/* Settings Dropdown */}
                  <div className="relative">
                    <button
  onClick={() => setShowSettings(!showSettings)}
  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
>
  <span>👤</span>
  <span className="text-sm font-medium text-gray-700">
    {user?.name || "User"}
  </span>
  <span className="text-xs">▼</span>
</button>
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showSettings && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div 
                            className="fixed inset-0 z-30"
                            onClick={() => setShowSettings(false)}
                          ></div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50"
                          >
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-gray-100">
                              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                            </div>
                            {/* Theme Toggle */}
                            <button
                              onClick={toggleTheme}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                {darkMode ? (
                                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Theme</p>
                                <p className="text-xs text-gray-500">{darkMode ? 'Dark mode' : 'Light mode'}</p>
                              </div>
                              <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-md ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                              </div>
                            </button>
                            {/* Logout */}
                          {/* Stats */}
<button
  onClick={() => {
    setShowStats(true);
    setShowSettings(false);
  }}
  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
>
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3v18m-4-4h8m-6-6h4" />
    </svg>
  </div>
  <div>
    <p className="text-sm font-medium text-gray-900">Stats</p>
    <p className="text-xs text-gray-500">View your insights</p>
  </div>
</button>

{/* Logout */}
<button
  onClick={handleLogout}
  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
>
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  </div>
  <div>
    <p className="text-sm font-medium text-red-600">Logout</p>
    <p className="text-xs text-red-500">Sign out of your account</p>
  </div>
</button>


                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <Link
                  to="/signin"
                  className="text-sm font-medium px-4 py-2 rounded-full text-gray-900 hover:bg-gray-100 transition-all duration-200"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </header>
          {/* Hero Section */}
          <section className="px-6 py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent blur-3xl animate-pulse-slow" />
            <div className="relative animate-fade-in">
              <h2 className="text-7xl font-bold tracking-tight leading-tight max-w-3xl animate-slide-up">
                Track your meals.
                <span className="block mt-2 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Build better habits.
                </span>
              </h2>
              <p className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed animate-slide-up-delay-1">
                BiteTrack is your personal food ledger — simple, fast, and beautifully
                designed to help you understand your eating patterns.
              </p>
              <div className="mt-8 flex items-center gap-4 animate-slide-up-delay-2">
                <button 
                  onClick={handleGetStarted}
                  disabled={isSignedIn}
                  className={`group relative inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium transition-all duration-200 overflow-hidden ${
                    isSignedIn
                      ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                      : 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-xl hover:scale-105'
                  }`}
                  title={isSignedIn ? "You are already signed in" : "Create an account or sign in"}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  <span className="relative">{isSignedIn ? 'Already Signed In' : 'Get Started'}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Demo
                </button>
              </div>
            </div>
          </section>
          {/* Stats Section */}
          <section className="px-6 pb-12 animate-fade-in-delay">
            <div className="flex flex-wrap gap-8 text-sm">
              {[
                { icon: '✓', text: 'Stay consistent daily' },
                { icon: '✓', text: 'Reduce unhealthy habits' },
                { icon: '✓', text: 'Build long-term discipline' },
                { icon: '✓', text: 'Understand your eating behavior' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 group hover:scale-105 transition-transform cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-green-500 text-lg group-hover:rotate-12 transition-transform">{stat.icon}</span>
                  <span className="font-semibold text-gray-900">{stat.text}</span>
                </div>
              ))}
            </div>
          </section>
          {/* How It Works Section */}
          <section className="px-6 py-20 relative" id="about">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">How it works</h3>
              <p className="text-gray-600 text-lg">Three simple steps to better eating habits</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              {[
                { num: '01', title: 'Log Your Meals', desc: 'Snap a photo or quickly type what you ate. Takes less than 10 seconds.', icon: '📸', color: 'from-blue-50 to-blue-100' },
                { num: '02', title: 'Track Patterns', desc: 'Our system analyzes your eating habits and identifies patterns automatically.', icon: '🧠', color: 'from-purple-50 to-purple-100' },
                { num: '03', title: 'Build Habits', desc: 'Get personalized insights and achieve your nutrition goals consistently.', icon: '🎯', color: 'from-green-50 to-green-100' },
              ].map((step, i) => (
                <div key={i} className="relative group" style={{ animationDelay: `${i * 200}ms` }}>
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-5xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors">{step.num}</span>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <span className="text-3xl">{step.icon}</span>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Features Grid */}
          <section className="px-6 py-20 bg-gradient-to-b from-transparent to-gray-50/50" id="features">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Everything you need</h3>
              <p className="text-gray-600 text-lg">Powerful features in a simple package</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: '⚡', title: 'Quick Log', desc: 'Add meals in seconds with minimal input. Just snap, tag, and you\'re done.', color: 'from-yellow-50 to-yellow-100', accent: 'group-hover:text-yellow-500' },
                { icon: '📊', title: 'Smart Insights', desc: 'View trends and patterns to build healthier habits over time.', color: 'from-blue-50 to-blue-100', accent: 'group-hover:text-blue-500' },
                { icon: '🎯', title: 'Daily Goals', desc: 'Stay consistent with simple, achievable daily and weekly goals.', color: 'from-green-50 to-green-100', accent: 'group-hover:text-green-500' },
                { icon: '📱', title: 'Mobile First', desc: 'Beautiful native apps for iOS and Android. Track on the go.', color: 'from-purple-50 to-purple-100', accent: 'group-hover:text-purple-500' },
                { icon: '🔒', title: 'Private & Secure', desc: 'Your data is encrypted and never shared. You own everything.', color: 'from-red-50 to-red-100', accent: 'group-hover:text-red-500' },
                { icon: '🌙', title: 'Dark Mode', desc: 'Easy on the eyes with a beautiful dark mode interface.', color: 'from-gray-50 to-gray-100', accent: 'group-hover:text-gray-500' },
              ].map((feature, i) => (
                <div key={i} className="group relative p-8 rounded-2xl bg-[var(--app-surface)]/80 backdrop-blur border border-[var(--app-border)] hover:border-[var(--app-border)] shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 from-[var(--app-surface)]/50 to-transparent"></div>
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <span className="text-3xl">{feature.icon}</span>
                    </div>
                    <h3 className={`text-xl font-semibold text-gray-900 mb-2 transition-colors ${feature.accent}`}>{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Testimonials */}
          <section className="px-6 py-20">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Loved by thousands</h3>
              <p className="text-gray-600 text-lg">See what our users are saying</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Sarah Chen', role: 'Fitness Enthusiast', text: 'BiteTrack changed how I think about food. The insights are incredible and the interface is so clean!', avatar: '👩‍💼', rating: 5 },
                { name: 'Mike Johnson', role: 'Busy Parent', text: 'Finally, a food tracker that doesn\'t feel like work. I\'ve been consistent for 6 months now.', avatar: '👨‍💻', rating: 5 },
                { name: 'Emma Davis', role: 'Nutritionist', text: 'I recommend BiteTrack to all my clients. It\'s the perfect balance of simple and powerful.', avatar: '👩‍⚕️', rating: 5 },
              ].map((testimonial, i) => (
                <div key={i} className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 group-hover:scale-110 transition-transform" style={{ transitionDelay: `${i * 50}ms` }}>⭐</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* CTA Section */}
          <section className="px-6 py-20">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-16 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50 animate-gradient bg-[length:200%_auto]"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float-delay" />
              <div className="relative text-center">
                <h3 className="text-5xl font-bold mb-4 animate-slide-up">Start tracking today</h3>
                <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-10 animate-slide-up-delay-1">
                  Join thousands building consistent habits with BiteTrack. It's free to start, no credit card required.
                </p>
                <div className="flex items-center justify-center gap-4 animate-slide-up-delay-2">
                  {isSignedIn ? (
                    <button
                      disabled={true}
                      className="group inline-flex items-center gap-2 rounded-full bg-gray-400 px-10 py-4 text-base font-medium text-white shadow-xl cursor-not-allowed opacity-60 transition-all duration-300"
                      title="You are already signed in"
                    >
                      Already Signed In
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      to="/signup"
                      onClick={handleGetStarted}
                      className="group inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-base font-medium text-gray-900 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
                    >
                      Create Free Account
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                  <Link
                    to="/learn-more"
                    className="text-white/90 hover:text-white text-lg font-medium transition-colors flex items-center gap-2 group"
                  >
                    Learn more
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
          {/* Footer */}
          <footer className="px-6 py-12 border-t border-gray-200/50">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-gray-900 to-gray-700 rounded-md flex items-center justify-center text-white text-xs font-bold">
                    B
                  </div>
                  <span className="font-bold text-gray-900">BiteTrack</span>
                </div>
                <p className="text-sm text-gray-600">Your personal food ledger for building better habits.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link to="/features" className="hover:text-gray-900 transition-colors">Features</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link to="/about" className="hover:text-gray-900 transition-colors">About</Link></li>
                  <li><Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link></li>
                  <li><Link to="/terms" className="hover:text-gray-900 transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-sm text-gray-600">© 2026 BiteTrack. All rights reserved.</span>
              <div className="flex items-center gap-4">
                {['Twitter', 'GitHub', 'Discord'].map((social) => (
                  <button key={social} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-900 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <span className="text-xs font-bold">{social[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </footer>
        </div>
      </div>
      {showStats && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
    onClick={() => setShowStats(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white w-[90%] max-w-xl rounded-2xl shadow-2xl overflow-hidden"
    >

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-bold">Your Stats</h2>
        <button
          onClick={() => setShowStats(false)}
          className="text-gray-500 hover:text-gray-900"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">

        <div className="grid grid-cols-2 gap-4">

          <div className="bg-gray-100 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-xl font-bold">{stats.totalOrders}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-xl font-bold">₹ {stats.totalSpent}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Avg Spend</p>
            <p className="text-xl font-bold">₹ {stats.avgSpend}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Top Restaurant</p>
            <p className="text-xl font-bold">{stats.topRestaurant}</p>
          </div>

        </div>

        {/* Budget UI */}
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-2">Set Monthly Budget</p>

          <input
            type="number"
            placeholder="Enter amount"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          />

          <button 
            onClick={handleSaveBudget}
            className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800 transition-colors"
          >
            Save Budget
          </button>
        </div>

      </div>

    </div>
  </div>
)}



    </motion.div>
  );
}
export default App;

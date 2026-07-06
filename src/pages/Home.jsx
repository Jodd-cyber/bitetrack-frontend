import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useEffect } from "react";
import getApiBase from "../utils/apiBase";
import ProfileModal from "../components/ProfileModal";
import ThemeSelector from "../components/ThemeSelector";

function App() {
  const { isSignedIn, user, login, logout } = useAuth();
  const { theme, setTheme, darkMode } = useTheme();
  const API_BASE = getApiBase();
  const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
  let storedUser = null;

  try {
    storedUser = JSON.parse(
      localStorage.getItem("bitetrack_user") ||
      sessionStorage.getItem("bitetrack_user") ||
      "null"
    );
  } catch {
    storedUser = null;
  }

  const effectiveUser = user || storedUser;
  const effectiveSignedIn = Boolean(isSignedIn || storedToken || effectiveUser);
  
  // Dynamic budget storage key - computed at save time, not at mount time
  const getBudgetStorageKey = () => {
    return `bitetrack_monthly_budget_${effectiveUser?.id || 'temp'}`;
  };
  const [showWarning, setShowWarning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showBudgetSuccess, setShowBudgetSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [saveForAllMonths, setSaveForAllMonths] = useState(false);
const [stats, setStats] = useState({
  totalOrders: 0,
  totalSpent: 0,
  avgSpend: 0,
  topRestaurant: "-"
});
const [profileStats, setProfileStats] = useState({ age: '', height: '', weight: '', gender: '', goal: '' });
const [isSavingProfile, setIsSavingProfile] = useState(false);

const handleSaveBudget = async () => {
  if (!monthlyBudget || monthlyBudget <= 0) {
    alert("Please enter a valid budget amount");
    return;
  }

  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/api/budget`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(monthlyBudget),
          saveForAllMonths,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save budget");
    }

    setShowBudgetSuccess(true);

    setTimeout(() => {
      setShowBudgetSuccess(false);
    }, 3000);

  } catch (err) {
    console.error("Budget save error:", err);
    alert("Error saving budget");
  }
};

const handleDeleteBudget = async () => {
  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    await fetch(
      `${API_BASE}/api/budget`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMonthlyBudget("");
    alert("Budget deleted");

  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting budget");
  }
};

  // Pre-warm the backend on mount (wakes up Render service early)
  useEffect(() => {
    const API_BASE = getApiBase();
    fetch(`${API_BASE}/api/health`).catch(() => {
      fetch(`${API_BASE}/`); // Fallback if /api/health doesn't exist
    });
  }, []);

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
    if (!effectiveSignedIn) {
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
    setMonthlyBudget("");
    setProfileStats({ age: '', height: '', weight: '', gender: '', goal: '' });
  };

  useEffect(() => {
    document.title = "Home | BiteTrack";
  }, []);

  // 👇 PASTE HERE (below handleLogout)
useEffect(() => {
  if (!showStats) return;

  const fetchStats = async () => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        avgSpend: 0,
        topRestaurant: "-"
      });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/foodlogs`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Expected array from API');
      }

      const totalOrders = data.length;

      const totalSpent = data.reduce(
        (sum, item) => sum + Number(item.amount ?? (item.items?.reduce((s, i) => s + i.calories, 0) || 0)),
        0
      );

      const avgSpend = totalOrders
        ? Math.round(totalSpent / totalOrders)
        : 0;

      const restaurantSpend = {};
      data.forEach((item) => {
        if (item.restaurant) {
          const spend = Number(item.amount ?? (item.items?.reduce((s, i) => s + i.calories, 0) || 0));
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

    try {
      const profileRes = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData) {
        setProfileStats({
          age: profileData.age || '',
          height: profileData.height || '',
          weight: profileData.weight || '',
          gender: profileData.gender || '',
          goal: profileData.goal || ''
        });
      }
      // Also fetch budget
      const budgetRes = await fetch(`${API_BASE}/api/budget`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const budgetData = await budgetRes.json();
      if (budgetRes.ok && budgetData.success && budgetData.data && budgetData.data.amount) {
        setMonthlyBudget(budgetData.data.amount);
        setSaveForAllMonths(budgetData.data.saveForAllMonths || false);
      } else {
        setMonthlyBudget("");
        setSaveForAllMonths(false);
      }

    } catch (err) {
      console.error("Profile/Budget fetch error:", err);
    }
  };

  fetchStats();
}, [showStats]);

const handleSaveProfile = async () => {
  setIsSavingProfile(true);
  try {
    const API_BASE = getApiBase();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    await fetch(`${API_BASE}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        age: Number(profileStats.age) || undefined,
        height: Number(profileStats.height) || undefined,
        weight: Number(profileStats.weight) || undefined,
        gender: profileStats.gender,
        goal: profileStats.goal
      })
    });
    alert("Health profile saved successfully!");
  } catch (err) {
    console.error("Failed to save profile", err);
    alert("Error saving profile");
  } finally {
    setIsSavingProfile(false);
  }
};

useEffect(() => {
  const handleScroll = () => {
    setShowBackToTop(window.scrollY > 400);
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      {/* Warning Modal */}
      {/* ═══════════════════════════════════════════════════
    ENHANCED SUCCESS MODAL
═══════════════════════════════════════════════════ */}
{showBudgetSuccess && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
    <div 
      className="absolute inset-0 bg-black/50 backdrop-blur-md"
      onClick={() => setShowBudgetSuccess(false)}
    ></div>
      {/* ═══════════════════════════════════════════════════ */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="relative bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] p-6 max-w-md w-full"
    >
      {/* Success Icon */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[var(--app-text)] mb-2">Budget saved successfully!</h3>
          <p className="text-[var(--app-text-muted)] text-sm leading-relaxed">
            Your monthly budget of <span className="font-semibold text-green-600 dark:text-green-400">₹{monthlyBudget}</span> has been set. Check your Ledger to track spending.
          </p>
        </div>
        
        <button
          onClick={() => setShowBudgetSuccess(false)}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-[var(--app-surface-soft)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar animation */}
      <div className="mt-4 h-1 bg-[var(--app-surface-soft)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3 }}
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
          onAnimationComplete={() => setShowBudgetSuccess(false)}
        />
      </div>
    </motion.div>
  </div>
)}

{/* ═══════════════════════════════════════════════════
    ENHANCED WARNING MODAL
═══════════════════════════════════════════════════ */}
{showWarning && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
    <div 
      className="absolute inset-0 bg-black/50 backdrop-blur-md"
      onClick={() => setShowWarning(false)}
    ></div>
    
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="relative bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] p-6 max-w-md w-full"
    >
      <div className="flex items-start gap-4">
        {/* Warning Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"></div>
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[var(--app-text)] mb-2">Sign in required</h3>
          <p className="text-[var(--app-text-muted)] text-sm mb-5 leading-relaxed">
            Please sign in or create an account to start tracking your food orders and unlock all features.
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link
              to="/signin"
              className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200 text-center"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="flex-1 px-5 py-3 border-2 border-[var(--app-border)] text-[var(--app-text)] text-sm font-semibold rounded-xl hover:bg-[var(--app-surface-soft)] transition-all duration-200 text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
        
        <button
          onClick={() => setShowWarning(false)}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-[var(--app-surface-soft)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  </div>
)}

{/* ═══════════════════════════════════════════════════
    VIDEO DEMO MODAL
═══════════════════════════════════════════════════ */}
{showDemo && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
    <div 
      className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      onClick={() => setShowDemo(false)}
    ></div>
    
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="relative bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] overflow-hidden max-w-5xl w-full aspect-video"
    >
      {/* Close Button */}
      <button
        onClick={() => setShowDemo(false)}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all hover:rotate-90"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Video Content */}
      <div className="w-full h-full bg-black flex items-center justify-center">
        <video 
          controls 
          autoPlay 
          className="w-full h-full"
          src="/demo.mp4"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Footer / Caption */}
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <h3 className="text-white text-xl font-bold">BiteTrack Demo</h3>
        <p className="text-white/70 text-sm">See how easy it is to track your meals and manage your budget.</p>
      </div>
    </motion.div>
  </div>
)}

<div className="min-h-screen bg-[var(--app-bg)] overflow-hidden">
  <div className="mx-auto max-w-6xl">
    {/* ═══════════════════════════════════════════════════
        ENHANCED HEADER (Ultra-Responsive)
    ═══════════════════════════════════════════════════ */}
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-2 md:mx-4 mt-4 px-2 md:px-4 py-4 sticky top-4 z-40 dark:border dark:border-[var(--app-border)] rounded-2xl md:rounded-full sm:px-6 liquid-glass-navbar"
    >
      {/* Mobile & Tablet Header (Merged & Enhanced) */}
      <div className="md:hidden flex flex-col gap-3 py-1">
        {/* Row 1: Logo & Nav */}
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur-md opacity-50"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                B
              </div>
            </div>
            <div className="flex flex-col -gap-1">
              <span className="text-[11px] font-bold text-[var(--app-text)] leading-none">BiteTrack</span>
              <span className="text-[7px] text-[var(--app-text-muted)]">Your Food Ledger</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowFeatures(true)}
              className="Btn text-[9px] px-3 py-1.5 flex-shrink-0"
            >
              Features
            </button>
            <button 
              onClick={() => setShowAbout(true)}
              className="Btn text-[9px] px-3 py-1.5 flex-shrink-0"
            >
              About
            </button>
          </div>
        </div>

        {/* Row 2: Actions */}
        <div className="flex items-center justify-end gap-2">
          {effectiveSignedIn ? (
            <>
              <Link to="/ledger" className="button-3d scale-[0.8] origin-right flex-shrink-0">
                <div className="button-outer">
                  <div className="button-inner">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-[10px] px-1 whitespace-nowrap">My Ledger</span>
                  </div>
                </div>
              </Link>

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="Btn px-2 py-1.5 flex items-center gap-2"
                >
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white text-[9px] font-bold border border-white/30">
                    {effectiveUser?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-[10px] font-medium max-w-[80px] truncate">{effectiveUser?.name?.split(' ')[0]}</span>
                  <svg className={`w-3 h-3 transition-transform ${showSettings ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 bg-[var(--app-surface)] backdrop-blur-2xl rounded-2xl shadow-2xl border border-[var(--app-border)] py-2 z-50 overflow-hidden origin-top-right"
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-[var(--app-border)] bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                              {user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[var(--app-text)] truncate">{user?.name}</p>
                              <p className="text-[10px] text-[var(--app-text-muted)] truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Theme Toggle */}
                        <div className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--app-surface-soft)] transition-colors group">
                          <div className="flex-1 text-left">
                            <p className="text-xs font-medium text-[var(--app-text)]">Theme</p>
                          </div>
                          <ThemeSelector />
                        </div>

                        {/* Stats Button */}
                        <button
                          onClick={() => {
                            setShowStats(true);
                            setShowSettings(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--app-surface-soft)] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <p className="text-xs font-medium text-[var(--app-text)]">Your Stats</p>
                        </button>

                        {/* Logout */}
                        <button 
                          onClick={handleLogout} 
                          className="w-full px-4 py-4 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-t border-[var(--app-border)] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100/50 dark:bg-red-900/20 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold">Logout</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/signin" className="Btn text-[10px] px-6 py-2 flex-shrink-0">Sign In</Link>
          )}
        </div>
      </div>


      {/* Desktop Header */}
      <div className="hidden md:flex md:items-center md:justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              B
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--app-text)]">BiteTrack</h1>
            <p className="text-xs text-[var(--app-text-muted)]">Your Food Ledger</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <button className="Btn" onClick={(e) => { e.preventDefault(); setShowFeatures(true); }}>
            Features
          </button>
          <button className="Btn" onClick={(e) => { e.preventDefault(); setShowAbout(true); }}>
            About
          </button>

          {effectiveSignedIn ? (
            <div className="flex items-center gap-3">
              <Link
                to="/ledger"
                className="button-3d"
              >
                <div className="button-outer">
                  <div className="button-inner">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>My Ledger</span>
                  </div>
                </div>
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="Btn"
                  style={{ gap: '10px' }}
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white/30">
                    {effectiveUser?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span>
                    {effectiveUser?.name || "User"}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* ═══════════════════════════════════════════════════
                    ENHANCED SETTINGS DROPDOWN
                ═══════════════════════════════════════════════════ */}
                <AnimatePresence>
                  {showSettings && (
                    <>
                      <div 
                        className="fixed inset-0 z-30"
                        onClick={() => setShowSettings(false)}
                      ></div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-72 bg-[var(--app-surface)] rounded-2xl shadow-2xl border border-[var(--app-border)] py-2 z-50 overflow-hidden"
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-[var(--app-border)] bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                              {user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[var(--app-text)] truncate">{user?.name}</p>
                              <p className="text-xs text-[var(--app-text-muted)] truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Theme Toggle - Cosmic */}
                        <div className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--app-surface-soft)] transition-colors group">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                            darkMode 
                              ? 'bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30' 
                              : 'bg-gradient-to-br from-yellow-100 to-orange-100'
                          }`}>
                            {darkMode ? (
                              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-[var(--app-text)]">Theme</p>
                            <p className="text-xs text-[var(--app-text-muted)]">{darkMode ? 'Dark mode' : 'Light mode'}</p>
                          </div>
                          <ThemeSelector />
                        </div>

                        {/* Stats */}
                        <button
                          onClick={() => {
                            setShowStats(true);
                            setShowSettings(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--app-surface-soft)] transition-colors group"
                        >
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-[var(--app-text)]">Your Stats</p>
                            <p className="text-xs text-[var(--app-text-muted)]">View insights & analytics</p>
                          </div>
                        </button>

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-4 flex items-center gap-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border-t border-[var(--app-border)] group bg-red-50/50 dark:bg-red-900/10"
                        >
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">Logout</p>
                            <p className="text-xs text-red-500 dark:text-red-400/70">Sign out of your account</p>
                          </div>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <Link to="/signin" className="user-profile" aria-label="User Login Button">
              <div className="user-profile-inner">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g data-name="Layer 2" id="Layer_2">
                    <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                  </g>
                </svg>
                <p>Log In</p>
              </div>
            </Link>
          )}
        </nav>
      </div>
    </motion.header>

    {/* Hero Section - ENHANCED */}
<section className="px-6 py-24 md:py-32 relative overflow-hidden">
  {/* Animated Background */}
  <div className="absolute inset-0">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delay" />
  </div>

  <div className="relative max-w-5xl mx-auto text-center">
    {/* Badge */}
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)]/70 backdrop-blur-xl px-5 py-2.5 text-sm font-medium text-[var(--app-text-muted)] shadow-lg mb-8 animate-slide-down">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>
      Track smarter, eat better
    </div>

    {/* Main Heading */}
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-slide-up">
      <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-gray-100 dark:via-white dark:to-gray-100 bg-clip-text text-transparent">
        Your food journey
      </span>
      <br />
      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
        simplified
      </span>
    </h1>

    {/* Subheading */}
    <p className="mt-6 text-lg md:text-xl text-[var(--app-text-muted)] max-w-2xl mx-auto leading-relaxed animate-slide-up-delay-1">
      Track every meal, understand your habits, and build a healthier relationship with food — all in one beautiful app.
    </p>

    {/* CTA Buttons */}
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up-delay-2">
      <button 
        onClick={handleGetStarted}
        disabled={effectiveSignedIn}
        className="gradient-btn"
      >
        <div className="gradient-btn-inner">
          <span>{effectiveSignedIn ? 'Already Signed In' : 'Start Tracking Free'}</span>
          {!effectiveSignedIn && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </div>
      </button>

      <button 
        onClick={() => setShowDemo(true)}
        className="gradient-btn"
      >
        <div className="gradient-btn-inner">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Watch Demo</span>
        </div>
      </button>
    </div>

      </div>

    </section>
          {/* Stats Section */}
          <section className="px-6 pb-12 animate-fade-in-delay">
            <div className="flex flex-wrap gap-8 text-sm justify-center">
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
          {/* ═══════════════════════════════════════════════════
    ENHANCED HOW IT WORKS SECTION
═══════════════════════════════════════════════════ */}
{/* ═══════════════════════════════════════════════════
    ENHANCED HOW IT WORKS SECTION - UPDATED CONTENT
═══════════════════════════════════════════════════ */}
<section className="px-6 py-24 relative overflow-hidden" id="about">


  <div className="relative max-w-7xl mx-auto">
    {/* Section Header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-20"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-2 text-sm font-medium text-[var(--app-text-muted)] mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Simple & Powerful
      </div>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--app-text)] mb-4">
        How it works
      </h2>
      <p className="text-[var(--app-text-muted)] text-lg md:text-xl max-w-2xl mx-auto">
        Three powerful steps to track every food order and stay on budget
      </p>
    </motion.div>

    {/* Steps Container */}
    <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
      {/* Connecting Line - Desktop Only */}
      <div className="hidden md:block absolute top-20 left-[16.666%] right-[16.666%] h-0.5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--app-border)] to-transparent"></div>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 origin-left"
          style={{ height: '2px', top: '-0.5px' }}
        />
      </div>

      {/* Steps */}
      {[
        { 
          num: '01', 
          title: 'LOG ORDERS', 
          desc: 'Save every food order with price, restaurant, meal type, and personal notes. Quick and simple.', 
          icon: '📝', 
          gradient: 'from-blue-500 to-cyan-500',
          accentColor: 'text-blue-600 dark:text-blue-400',
          features: ['Price tracking', 'Restaurant name', 'Meal type', 'Custom notes']
        },
        { 
          num: '02', 
          title: 'VIEW INSIGHTS', 
          desc: 'Track total spent, top restaurant, order count, and spending patterns in one beautiful dashboard.', 
          icon: '📊', 
          gradient: 'from-purple-500 to-pink-500',
          accentColor: 'text-purple-600 dark:text-purple-400',
          features: ['Total spent', 'Top restaurant', 'Order count', 'Patterns']
        },
        { 
          num: '03', 
          title: 'STAY ON BUDGET', 
          desc: 'Set a monthly budget and download monthly or all-time PDF reports to stay in control.', 
          icon: '💰', 
          gradient: 'from-green-500 to-emerald-500',
          accentColor: 'text-green-600 dark:text-green-400',
          features: ['Budget tracker', 'PDF reports', 'Monthly view', 'All-time export']
        },
      ].map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.2 }}
        >
          {/* Rotating Border Card */}
          <div className="rotating-border-card">
            <div className="card-content">
              {/* Step Number & Icon */}
              <div className="flex items-center justify-between mb-6">
                <span className={`text-5xl font-black ${step.accentColor} opacity-20 group-hover:opacity-40 transition-opacity`}>
                  {step.num}
                </span>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                  {step.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[var(--app-text)] mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[var(--app-text-muted)] text-sm leading-relaxed mb-6">
                {step.desc}
              </p>

              {/* Feature List */}
              <div className="space-y-2 mt-auto">
                {step.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.gradient}`}></div>
                    <span className="text-[var(--app-text-muted)]">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Arrow Indicator (Desktop) */}
              {i < 2 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-30">
                  <motion.svg
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-6 h-6 text-white/30"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Bottom CTA */}
    
  </div>
</section>
          {/* Features Grid */}
         {/* Features Grid - ENHANCED */}
{/* ═══════════════════════════════════════════════════
    ENHANCED FEATURES SECTION - UPDATED CONTENT
═══════════════════════════════════════════════════ */}
<section className="px-6 py-24 relative overflow-hidden" id="features">
  {/* Background Decoration */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
  </div>

  <div className="relative max-w-7xl mx-auto">
    {/* Section Header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-20"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-2 text-sm font-medium text-[var(--app-text-muted)] mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
        </span>
        Powerful & Simple
      </div>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--app-text)] mb-4">
        Everything you need
      </h2>
      <p className="text-[var(--app-text-muted)] text-lg md:text-xl max-w-2xl mx-auto">
        All the tools to track food spending and stay on budget
      </p>
    </motion.div>

    {/* Features Grid */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[
        { 
          title: 'PERSONALIZED DASHBOARD', 
          desc: 'Get a birds-eye view of your eating habits with beautiful, interactive charts.', 
          icon: '📱', 
          iconBg: 'from-blue-500 to-cyan-500', 
          highlights: ['Live spend tracking', 'Monthly trends', 'Category breakdown'] 
        },
        { 
          title: 'SMART BUDGETING', 
          desc: 'Set limits for different meal types and get notified as you approach them.', 
          icon: '🎯', 
          iconBg: 'from-purple-500 to-pink-500', 
          highlights: ['Daily limits', 'Overspend alerts', 'Savings targets'] 
        },
        { 
          title: 'PDF REPORTS', 
          desc: 'Generate professional expense reports for your food spending with a single tap.', 
          icon: '📄', 
          iconBg: 'from-green-500 to-emerald-500', 
          highlights: ['Monthly summaries', 'Tax-ready exports', 'Custom date ranges'] 
        },
        { 
          title: 'RESTAURANT ANALYTICS', 
          desc: 'Discover your most-visited spots and how much you spend at each one.', 
          icon: '🏪', 
          iconBg: 'from-orange-500 to-red-500', 
          highlights: ['Top 5 restaurants', 'Average order cost', 'Visit frequency'] 
        },
        {
          title: 'AI ASSISTANT',
          desc: 'Chat with our intelligent AI to get personalized health and diet recommendations.',
          icon: '🤖',
          iconBg: 'from-teal-500 to-emerald-500',
          highlights: ['Diet suggestions', 'Health tips', 'Personalized advice']
        },
        {
          title: 'EMAIL SYNC',
          desc: 'Automatically sync your food orders and receipts directly from your email inbox.',
          icon: '📧',
          iconBg: 'from-amber-500 to-orange-500',
          highlights: ['Auto-import', 'Gmail integration', 'Seamless tracking']
        },
        {
          title: 'RECEIPT SCANNER',
          desc: 'Scan your physical food receipts to log orders instantly without manual entry.',
          icon: '🧾',
          iconBg: 'from-fuchsia-500 to-pink-500',
          highlights: ['Instant scanning', 'OCR tech', 'Quick logging']
        },
        { 
          title: 'MEAL CATEGORIES', 
          desc: 'Organize your spending by breakfast, lunch, dinner, or custom tags.', 
          icon: '🍱', 
          iconBg: 'from-indigo-500 to-blue-500', 
          highlights: ['Custom tagging', 'Meal type filtering', 'Time-of-day analysis'] 
        },
        { 
          title: 'MULTI-DEVICE SYNC', 
          desc: 'Access your data from anywhere. Your ledger is always up to date.', 
          icon: '☁️', 
          iconBg: 'from-pink-500 to-rose-500', 
          highlights: ['Cloud backups', 'Real-time sync', 'Export anytime'] 
        }
      ].map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="group relative"
        >
          {/* Rotating Border Card */}
          <div className="rotating-border-card" style={{ '--card-height': '450px' }}>
            <div className="card-content">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-6 shadow-lg text-3xl`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[var(--app-text)] mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[var(--app-text-muted)] text-sm leading-relaxed mb-6">
                {feature.desc}
              </p>

              {/* Highlights */}
              <div className="space-y-2 mt-auto">
                {feature.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.iconBg}`}></div>
                    <span className="text-[var(--app-text-muted)]">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Bottom CTA */}
    
  </div>
</section>
          {/* Testimonials */}
          <section className="px-6 py-20">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Loved by thousands</h3>
                <p className="text-gray-600 text-lg">The tools that make tracking effortless</p>
            </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '📊', title: 'Smart Analytics', desc: 'Understand your eating habits instantly with beautiful charts.' },
            { icon: '🔔', title: 'Budget Alerts', desc: 'Avoid overspending on food with real-time notifications.' },
            { icon: '📄', title: 'Export Reports', desc: 'Download monthly summaries in PDF format for your records.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="testimonial-card"
            >
              <div className="testimonial-card-inner">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold text-[var(--app-text)] mb-3">{feature.title}</h4>
                <p className="text-[var(--app-text-muted)] leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
         {/* ═══════════════════════════════════════════════════
    ENHANCED CTA SECTION
═══════════════════════════════════════════════════ */}
<section className="px-6 py-24 relative">
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-zinc-900 dark:via-blue-950 dark:to-purple-950 text-white shadow-2xl"
  >
    {/* Animated Background Layers */}
    <div className="absolute inset-0">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-60 animate-gradient bg-[length:200%_200%]"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Floating Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float-delay"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
    </div>

    {/* Content Container */}
    <div className="relative px-8 py-16 md:px-16 md:py-20 lg:px-24 lg:py-24">
      <div className="max-w-4xl mx-auto">
        {/* Badge */}
       
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight"
        >
          Ready to transform your
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            eating habits?
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/80 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
        >
          Join thousands building consistent habits with BiteTrack. Start tracking for free — no credit card required, no commitments.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          {effectiveSignedIn ? (
            <button
              disabled={true}
              className="gradient-btn"
              title="You are already signed in"
            >
              <div className="gradient-btn-inner">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Already Signed In</span>
              </div>
            </button>
          ) : (
            <Link
              to="/signup"
              onClick={handleGetStarted}
              className="gradient-btn"
              style={{ textDecoration: 'none' }}
            >
              <div className="gradient-btn-inner">
                <span>Create Free Account</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          )}

          <button
            onClick={() => {
              document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all duration-300"
          >
            Learn More
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-white/10"
        >
          {[
            { icon: '✨', label: 'Free Forever', sublabel: 'Core features' },
            { icon: '🔒', label: 'Secure & Private', sublabel: 'Bank-level encryption' },
            { icon: '⚡', label: 'Instant Setup', sublabel: 'Under 2 minutes' },
            { icon: '📱', label: 'All Devices', sublabel: 'Web & Mobile' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform border border-white/20">
                {item.icon}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-white/60">{item.sublabel}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

       
      </div>
    </div>

    {/* Bottom Glow */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
  </motion.div>
</section>  
          
        </div>
      </div>
      {showStats && (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
    onClick={() => setShowStats(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-[var(--app-surface)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up border border-[var(--app-border)]"
    >
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-[var(--app-border)] bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--app-text)]">Your Statistics</h2>
              </div>

          </div>
          <button
            onClick={() => setShowStats(false)}
            className="w-10 h-10 rounded-full hover:bg-[var(--app-surface-soft)] flex items-center justify-center transition-colors text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: '🍽️', color: 'from-blue-500 to-cyan-500' },
            { label: 'Total Spent', value: `₹${stats.totalSpent}`, icon: '💰', color: 'from-green-500 to-emerald-500' },
            { label: 'Avg Spend', value: `₹${stats.avgSpend}`, icon: '📊', color: 'from-purple-500 to-pink-500' },
            { label: 'Top Restaurant', value: stats.topRestaurant, icon: '⭐', color: 'from-orange-500 to-red-500' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="relative group p-5 rounded-2xl bg-gradient-to-br from-[var(--app-surface-soft)] to-[var(--app-surface)] border border-[var(--app-border)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} opacity-10`} />
                </div>
                <p className="text-sm text-[var(--app-text-muted)] mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[var(--app-text)] truncate">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Budget Section */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[var(--app-text)]">Monthly Budget</h3>
              <p className="text-sm text-[var(--app-text-muted)]">Set your spending limit</p>
            </div>
          </div>

          <input
            type="number"
            placeholder="Enter amount (₹)"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:border-blue-500 focus:outline-none transition-colors mb-3"
          />

          <label className="flex items-center gap-2 text-sm text-[var(--app-text-muted)] cursor-pointer mb-3 ml-1 hover:text-[var(--app-text)] transition-colors">
            <input 
              type="checkbox" 
              checked={saveForAllMonths}
              onChange={(e) => setSaveForAllMonths(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-[var(--app-surface)]"
            />
            <span>Save budget for all future months</span>
          </label>

          <div className="flex gap-3">
            <button 
              onClick={handleSaveBudget}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              💾 Save Budget
            </button>
            <button
              onClick={handleDeleteBudget}
              className="px-6 py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              🗑️
            </button>
          </div>
        </div>
        </div>

        {/* Health Profile Section */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[var(--app-text)]">Health Profile</h3>
              <p className="text-sm text-[var(--app-text-muted)]">Optional details for AI calculations</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[var(--app-text)] mb-1">Age (Years)</label>
              <input type="number" min="1" max="120" value={profileStats.age} onChange={e => setProfileStats({...profileStats, age: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--app-text)] mb-1">Gender</label>
              <select value={profileStats.gender} onChange={e => setProfileStats({...profileStats, gender: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] outline-none">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--app-text)] mb-1">Height (cm)</label>
              <input type="number" min="50" max="300" value={profileStats.height} onChange={e => setProfileStats({...profileStats, height: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--app-text)] mb-1">Weight (kg)</label>
              <input type="number" min="20" max="300" value={profileStats.weight} onChange={e => setProfileStats({...profileStats, weight: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[var(--app-text)] mb-1">Health Goal</label>
              <select value={profileStats.goal} onChange={e => setProfileStats({...profileStats, goal: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] outline-none">
                <option value="">Select a Goal</option>
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Build Muscle</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            {isSavingProfile ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </div>
    </div>
)}

      {/* ═══════════════════════════════════════════════════
    ENHANCED TERMS MODAL
═══════════════════════════════════════════════════ */}
{showTerms && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowTerms(false)}>
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()} 
      className="bg-[var(--app-surface)] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-[var(--app-border)]"
    >
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-[var(--app-border)] bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--app-text)]">Terms & Conditions</h2>
            <p className="text-sm text-[var(--app-text-muted)]">Last updated: January 2024</p>
          </div>
          <button 
            onClick={() => setShowTerms(false)} 
            className="w-10 h-10 rounded-full hover:bg-[var(--app-surface-soft)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-h-[60vh] overflow-y-auto space-y-6 custom-scrollbar">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-[var(--app-text)] leading-relaxed">
            By using BiteTrack, you agree to the following terms and conditions. Please read them carefully.
          </p>
        </div>

        {[
          {
            icon: '⚖️',
            title: '1. Service Usage',
            content: 'BiteTrack is provided as-is for personal food tracking. Users must use the service responsibly and not for any harmful purposes.',
            color: 'from-blue-500 to-cyan-500'
          },
          {
            icon: '👤',
            title: '2. User Responsibilities',
            content: 'Users are responsible for maintaining the confidentiality of their account credentials and all activities under their account.',
            color: 'from-purple-500 to-pink-500'
          },
          {
            icon: '✅',
            title: '3. Acceptable Use',
            content: 'You agree not to use BiteTrack for any illegal activities, harassment, or any behavior that violates our community standards.',
            color: 'from-green-500 to-emerald-500'
          },
          {
            icon: '📊',
            title: '4. Data Accuracy',
            content: 'While we strive for accuracy, all calorie and nutritional information is approximate. Always consult professional nutritionists for medical advice.',
            color: 'from-orange-500 to-red-500'
          },
          {
            icon: '🛡️',
            title: '5. Limitation of Liability',
            content: 'BiteTrack is not responsible for any indirect, incidental, or consequential damages arising from your use of our service.',
            color: 'from-red-500 to-rose-500'
          },
          {
            icon: '🔄',
            title: '6. Changes to Terms',
            content: 'These terms may be updated in the future. Continued use of the service means you accept any changes.',
            color: 'from-indigo-500 to-purple-500'
          }
        ].map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-5 rounded-2xl bg-[var(--app-surface-soft)] border border-[var(--app-border)] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {section.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--app-text)] mb-2 text-lg">{section.title}</h3>
                <p className="text-[var(--app-text-muted)] text-sm leading-relaxed">{section.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </motion.div>
  </div>
)}
{/* ═══════════════════════════════════════════════════
    ENHANCED PRIVACY MODAL
═══════════════════════════════════════════════════ */}
{showPrivacy && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowPrivacy(false)}>
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()} 
      className="bg-[var(--app-surface)] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-[var(--app-border)]"
    >
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-[var(--app-border)] bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--app-text)]">Privacy Policy</h2>
            <p className="text-sm text-[var(--app-text-muted)]">Your privacy matters to us</p>
          </div>
          <button 
            onClick={() => setShowPrivacy(false)} 
            className="w-10 h-10 rounded-full hover:bg-[var(--app-surface-soft)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-h-[60vh] overflow-y-auto space-y-6 custom-scrollbar">
        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-[var(--app-text)] leading-relaxed">
            BiteTrack respects your privacy and is committed to protecting your personal data. This policy explains how we handle your information.
          </p>
        </div>

        {[
          {
            icon: '📝',
            title: '1. Information We Collect',
            content: 'We collect basic account information such as your name, email, and food log data that you voluntarily add to the platform.',
            color: 'from-blue-500 to-cyan-500'
          },
          {
            icon: '🎯',
            title: '2. How We Use Your Data',
            content: 'Your data is used exclusively to provide BiteTrack services. We do not sell, share, or trade your personal information with third parties.',
            color: 'from-purple-500 to-pink-500'
          },
          {
            icon: '🔐',
            title: '3. Data Security',
            content: 'We implement industry-standard security measures to protect your data from unauthorized access or disclosure.',
            color: 'from-green-500 to-emerald-500'
          },
          {
            icon: '🍪',
            title: '4. Cookies and Tracking',
            content: 'We may use cookies for authentication and improving user experience. You can disable cookies in your browser settings.',
            color: 'from-orange-500 to-red-500'
          },
          {
            icon: '👥',
            title: '5. Your Rights',
            content: 'You have the right to access, modify, or delete your personal data at any time by contacting us or through your account settings.',
            color: 'from-indigo-500 to-purple-500'
          },
          {
            icon: '📧',
            title: '6. Contact Us',
            content: 'If you have questions about this Privacy Policy, please contact us at privacy@bitetrack.com.',
            color: 'from-red-500 to-rose-500'
          }
        ].map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-5 rounded-2xl bg-[var(--app-surface-soft)] border border-[var(--app-border)] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {section.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--app-text)] mb-2 text-lg">{section.title}</h3>
                <p className="text-[var(--app-text-muted)] text-sm leading-relaxed">{section.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--app-border)] bg-[var(--app-surface-soft)] flex justify-end">
        <button 
          onClick={() => setShowPrivacy(false)} 
          className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Got it
        </button>
      </div>
    </motion.div>
  </div>
)}

{/* ═══════════════════════════════════════════════════
    ENHANCED ABOUT MODAL
═══════════════════════════════════════════════════ */}
{showAbout && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowAbout(false)}>
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()} 
      className="bg-[var(--app-surface)] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-[var(--app-border)]"
    >
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-[var(--app-border)] bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--app-text)]">About BiteTrack</h2>
            <p className="text-sm text-[var(--app-text-muted)]">Your personal food ledger</p>
          </div>
          <button 
            onClick={() => setShowAbout(false)} 
            className="w-10 h-10 rounded-full hover:bg-[var(--app-surface-soft)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-h-[60vh] overflow-y-auto space-y-6 custom-scrollbar">
        {/* Hero Description */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
          <p className="text-[var(--app-text)] font-medium text-lg leading-relaxed mb-3">
            BiteTrack is your personal food ledger — designed to help you track meals, analyze spending, and build better eating habits without any complexity.
          </p>
          <p className="text-[var(--app-text-muted)] text-sm leading-relaxed">
            Whether you're ordering from Swiggy, Zomato, or eating out locally, BiteTrack helps you understand your patterns and take control of your daily habits.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="p-5 rounded-2xl bg-[var(--app-surface-soft)] border border-[var(--app-border)]">
          <h3 className="font-bold text-[var(--app-text)] mb-3 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            Built with Modern Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {['React', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Framer Motion'].map((tech, i) => (
              <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-[var(--app-text)] text-sm font-medium rounded-lg border border-blue-200 dark:border-blue-800">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Why BiteTrack */}
        <div>
          <h3 className="font-bold text-[var(--app-text)] text-xl mb-4 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Why Choose BiteTrack?
          </h3>
          <div className="space-y-3">
            {[
              { icon: '📊', title: 'Track Easily', desc: 'Log your meals in seconds with a clean interface' },
              { icon: '🧠', title: 'Stay Aware', desc: 'Understand your spending and eating habits clearly' },
              { icon: '🎯', title: 'Build Habits', desc: 'Make smarter decisions and improve consistency' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-[var(--app-surface-soft)] border border-[var(--app-border)] hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl shadow-lg">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--app-text)] mb-1">{item.title}</h4>
                  <p className="text-[var(--app-text-muted)] text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--app-border)] bg-[var(--app-surface-soft)] flex justify-end">
        <button 
          onClick={() => setShowAbout(false)} 
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Got it
        </button>
      </div>
    </motion.div>
  </div>
)}

{/* ═══════════════════════════════════════════════════
    ENHANCED CONTACT MODAL
═══════════════════════════════════════════════════ */}
{showContact && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowContact(false)}>
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()} 
      className="bg-[var(--app-surface)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[var(--app-border)]"
    >
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-[var(--app-border)] bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--app-text)]">Contact Us</h2>
            <p className="text-sm text-[var(--app-text-muted)]">We'd love to hear from you</p>
          </div>
          <button 
            onClick={() => setShowContact(false)} 
            className="w-10 h-10 rounded-full hover:bg-[var(--app-surface-soft)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-[var(--app-text)] text-xl mb-2">Get in Touch</h3>
          <p className="text-[var(--app-text-muted)] mb-6">
            Have questions or feedback? We're here to help!
          </p>

          {/* Email Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 mb-6">
            <p className="text-sm text-[var(--app-text-muted)] mb-2">Email us at</p>
            <a href="mailto:support@bitetrack.com" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:underline">
              support@bitetrack.com
            </a>
            <p className="text-xs text-[var(--app-text-muted)] mt-2">We usually respond within 24 hours</p>
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '💡', title: 'Feature Request', desc: 'Suggest new features' },
            { icon: '🐛', title: 'Bug Report', desc: 'Report issues' },
            { icon: '💬', title: 'General Feedback', desc: 'Share your thoughts' }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--app-surface-soft)] border border-[var(--app-border)] hover:shadow-lg transition-all text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h4 className="font-semibold text-[var(--app-text)] text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-[var(--app-text-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-[var(--app-text)] text-center leading-relaxed">
            Whether it's a feature request, bug report, or general feedback, we're listening. Help us make BiteTrack better for everyone! 🚀
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--app-border)] bg-[var(--app-surface-soft)] flex justify-end">
        <button 
          onClick={() => setShowContact(false)} 
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Got it
        </button>
      </div>
    </motion.div>
  </div>
)}

{/* ═══════════════════════════════════════════════════
    ENHANCED FEATURES MODAL
═══════════════════════════════════════════════════ */}
{showFeatures && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowFeatures(false)}>
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()} 
      className="bg-[var(--app-surface)] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-[var(--app-border)]"
    >
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-[var(--app-border)] bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--app-text)]">BiteTrack Features</h2>
            <p className="text-sm text-[var(--app-text-muted)]">Everything you need to track food</p>
          </div>
          <button 
            onClick={() => setShowFeatures(false)} 
            className="w-10 h-10 rounded-full hover:bg-[var(--app-surface-soft)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: '🍔',
              title: 'Food Log Tracking',
              content: 'Quickly log your meals with restaurant name, items, calories, and personal notes. Track everything you eat and spend.',
              color: 'from-yellow-500 to-orange-500'
            },
            {
              icon: '💰',
              title: 'Spending Analysis',
              content: 'View your monthly spending by restaurant, meal type, and date. Understand where your money goes.',
              color: 'from-green-500 to-emerald-500'
            },
            {
              icon: '📊',
              title: 'Smart Insights',
              content: 'See trends and patterns to build healthier habits over time. Get meaningful analytics about your eating patterns.',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              icon: '🎯',
              title: 'Monthly Budget',
              content: 'Set your monthly food budget and track spending against it. Stay within your limits with clear progress indicators.',
              color: 'from-purple-500 to-pink-500'
            },
            {
              icon: '🤖',
              title: 'AI Assistant',
              content: 'Chat with our intelligent AI to get personalized health and diet recommendations based on your food log.',
              color: 'from-teal-500 to-emerald-500'
            },
            {
              icon: '📧',
              title: 'Email Sync',
              content: 'Automatically sync your food orders and receipts directly from your email inbox for seamless tracking.',
              color: 'from-amber-500 to-orange-500'
            },
            {
              icon: '🧾',
              title: 'Receipt Scanner',
              content: 'Scan your physical food receipts to log orders instantly without any manual data entry.',
              color: 'from-fuchsia-500 to-pink-500'
            },
            {
              icon: '📱',
              title: 'Simple & Fast',
              content: 'Clean, intuitive interface designed for quick logging. Add your meals in seconds without any complexity.',
              color: 'from-indigo-500 to-purple-500'
            },
            {
              icon: '🔒',
              title: 'Private & Secure',
              content: 'Your data is encrypted and never shared. You have complete control over your personal information.',
              color: 'from-red-500 to-rose-500'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl bg-[var(--app-surface-soft)] border border-[var(--app-border)] hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[var(--app-text)] mb-2 text-lg">{feature.title}</h4>
                  <p className="text-[var(--app-text-muted)] text-sm leading-relaxed">{feature.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
)}

  {/* ═══════════════════════════════════════════════════
    ENHANCED FOOTER
═══════════════════════════════════════════════════ */}
<footer className="relative overflow-hidden border-t border-[var(--app-border)] bg-[var(--app-surface)]/30">
  {/* Background Decoration */}
  <div className="absolute inset-0 opacity-30">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
  </div>

  <div className="relative px-4 py-8 sm:px-6 max-w-7xl mx-auto">
    {/* Main Footer Content */}
    <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2 lg:grid-cols-4">
      {/* Brand Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-1"
      >
        <Link to="/" className="flex items-center gap-3 group mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              B
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--app-text)]">BiteTrack</h3>
            <p className="text-xs text-[var(--app-text-muted)]">Track smarter, eat better</p>
          </div>
        </Link>
        <p className="text-sm text-[var(--app-text-muted)] leading-relaxed mb-6">
          Your personal food ledger for building better eating habits and tracking spending effortlessly.
        </p>

      </motion.div>

      {/* Product Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h4 className="font-bold text-[var(--app-text)] mb-4 flex items-center gap-2">
          <span className="text-lg">📦</span>
          Product
        </h4>
        <ul className="space-y-3">
          {[
            { label: 'Features', action: () => setShowFeatures(true) }
          ].map((link, i) => (
            <li key={i}>
              {link.action ? (
                <button
                  onClick={link.action}
                  className="group text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors flex items-center gap-2"
                >
                  <span className="w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-4 transition-all duration-300"></span>
                  {link.label}
                </button>
              ) : (
                <a
                  href={link.href}
                  className="group text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors flex items-center gap-2"
                >
                  <span className="w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-4 transition-all duration-300"></span>
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Company Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4 className="font-bold text-[var(--app-text)] mb-4 flex items-center gap-2">
          <span className="text-lg">🏢</span>
          Company
        </h4>
        <ul className="space-y-3">
          {[
            { label: 'About', action: () => setShowAbout(true) },
            { label: 'Contact', action: () => setShowContact(true) }
          ].map((link, i) => (
            <li key={i}>
              {link.action ? (
                <button
                  onClick={link.action}
                  className="group text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors flex items-center gap-2"
                >
                  <span className="w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-4 transition-all duration-300"></span>
                  {link.label}
                </button>
              ) : (
                <a
                  href={link.href}
                  className="group text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors flex items-center gap-2"
                >
                  <span className="w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-4 transition-all duration-300"></span>
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Legal & Newsletter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h4 className="font-bold text-[var(--app-text)] mb-4 flex items-center gap-2">
          <span className="text-lg">📜</span>
          Legal
        </h4>
        <ul className="space-y-3 mb-6">
          {[
            { label: 'Privacy Policy', action: () => setShowPrivacy(true) },
            { label: 'Terms of Service', action: () => setShowTerms(true) }
          ].map((link, i) => (
            <li key={i}>
              {link.action ? (
                <button
                  onClick={link.action}
                  className="group text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors flex items-center gap-2"
                >
                  <span className="w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-4 transition-all duration-300"></span>
                  {link.label}
                </button>
              ) : (
                <a
                  href={link.href}
                  className="group text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors flex items-center gap-2"
                >
                  <span className="w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-4 transition-all duration-300"></span>
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>

    {/* Bottom Bar */}
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="pt-6 border-t border-[var(--app-border)]"
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center md:flex-row md:text-center">
        {/* Copyright */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <span className="text-sm text-[var(--app-text-muted)]">
            © {new Date().getFullYear()} BiteTrack. All rights reserved.
          </span>
          <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
            <span className="w-3.5 h-3.5 rounded-full animate-pulse liquid-glass-circle flex-shrink-0"></span>
            <span>All systems operational</span>
          </div>
        </div>

        {/* Made with Love */}
        

        
      </div>
    </motion.div>

    {/* Back to Top Button */}
    {showBackToTop && (
      <motion.button
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        whileHover={{ y: -4 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-7 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center z-40 group"
      >
        <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    )}
  </div>
</footer>

    </motion.div>
  );
}

  
export default App;

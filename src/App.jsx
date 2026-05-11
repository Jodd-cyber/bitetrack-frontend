import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp.jsx";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuthSuccess from "./pages/OAuthSuccess";
import Ledger from "./pages/Ledger";
import VantaBackground from "./components/VantaBackground";

// ✅ SIMPLE Protected Route - One source of truth
function ProtectedRoute({ element }) {
  const { isSignedIn, isLoading } = useAuth();

  // Also check localStorage directly as a fallback
  const hasToken = Boolean(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  );
  const hasUser = Boolean(
    localStorage.getItem("bitetrack_user") || sessionStorage.getItem("bitetrack_user")
  );

  // Show loading while auth restores
  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If still not signed in after loading AND no token in storage, redirect
  if (!isSignedIn && !hasToken && !hasUser) {
    return <Navigate to="/signin" replace />;
  }

  // Otherwise, show the page
  return element;
}



function App() {
  const location = useLocation();

  return (
    <>
      <VantaBackground />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        {/* Home is PUBLIC - it already handles both auth states internally */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes - require login */}
        <Route path="/ledger" element={<ProtectedRoute element={<Ledger />} />} />

        {/* Public Routes - no login required */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* OAuth Callback - Public, redirects to / after login */}
        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </AnimatePresence>
    </>
  );
}

export default App;
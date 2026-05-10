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

// ✅ SIMPLE Protected Route - One source of truth
function ProtectedRoute({ element }) {
  const { isSignedIn, isLoading } = useAuth();

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

  // If still not signed in after loading, redirect
  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  // Otherwise, show the page
  return element;
}

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Protected Routes - require login */}
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/ledger" element={<ProtectedRoute element={<Ledger />} />} />

        {/* Public Routes - no login required */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/learn-more" element={<LearnMore />} />
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
  );
}

export default App;
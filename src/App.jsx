import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp.jsx";
import LearnMore from "./pages/LearnMore";
import Ledger from "./pages/Ledger";
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

// ✅ Protected Route Component
function ProtectedRoute({ element }) {
  const { isSignedIn } = useAuth();

  // ❌ User is NOT signed in → redirect to signin
  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  // ✅ User IS signed in → show the page
  return element;
}

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ✅ Protected Routes (require login) */}
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/ledger" element={<ProtectedRoute element={<Ledger />} />} />

        {/* Public Routes */}
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
        
        {/* OAuth Callback (Public, but immediately redirects) */}
        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
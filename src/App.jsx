import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
// ... other imports

// ✅ Better Protected Route
function ProtectedRoute({ element }) {
  const { isSignedIn, isLoading } = useAuth();

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

  const hasPersistedAuth = Boolean(storedToken && storedUser);

  // ⏳ Show loading while auth state is being restored
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

  // ❌ Not signed in → redirect to signin
  if (!isSignedIn && !hasPersistedAuth) {
    return <Navigate to="/signin" replace />;
  }

  // ✅ Signed in → show the page
  return element;
}

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/ledger" element={<ProtectedRoute element={<Ledger />} />} />

        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        {/* ... rest of routes */}
        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
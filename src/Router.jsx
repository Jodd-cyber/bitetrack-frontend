import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Ledger from './pages/Ledger';
import LearnMore from './pages/LearnMore';
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import OAuthSuccess from "./pages/OAuthSuccess";



function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/ledger" element={<Ledger />} />
      <Route path="/learn-more" element={<LearnMore />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
    </Routes>
  );
}
export default Router;
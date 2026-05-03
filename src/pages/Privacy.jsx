import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 px-6 py-20"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              B
            </div>
            <span className="text-xl font-bold text-gray-900">BiteTrack</span>
          </Link>

          <Link
            to="/"
            className="px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-all"
          >
            ← Home
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-lg">
            Your data and privacy matter to us
          </p>
        </div>

        {/* Content */}
        <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-xl space-y-6">

          <p className="text-gray-700">
            BiteTrack respects your privacy and is committed to protecting your personal data.
            This policy explains what data we collect and how we use it.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Information We Collect
            </h2>
            <p className="text-gray-600">
              We collect basic account information such as your name, email, and food log data
              that you voluntarily add to the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              How We Use Your Data
            </h2>
            <p className="text-gray-600">
              Your data is used only to provide and improve the BiteTrack experience,
              including tracking your meals and showing personalized insights.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Data Security
            </h2>
            <p className="text-gray-600">
              We take reasonable measures to protect your data. Your information is not sold,
              shared, or misused.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Third-Party Services
            </h2>
            <p className="text-gray-600">
              BiteTrack may use third-party services (such as hosting or analytics),
              but your personal data remains secure and limited to necessary usage.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Changes to This Policy
            </h2>
            <p className="text-gray-600">
              This policy may be updated in the future. Continued use of the app
              means you accept any updates.
            </p>
          </div>

          <p className="text-sm text-gray-500 pt-4">
            Last updated: 2026
          </p>

        </div>

      </div>
    </motion.div>
  );
}

export default Privacy;
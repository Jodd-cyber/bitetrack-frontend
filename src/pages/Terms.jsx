import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Terms() {
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
            Terms & Conditions
          </h1>
          <p className="text-gray-600 text-lg">
            Please read these terms before using BiteTrack
          </p>
        </div>

        {/* Content */}
        <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-xl space-y-6">

          <p className="text-gray-700">
            By using BiteTrack, you agree to the following terms and conditions.
            These terms are designed to ensure a safe and fair experience for all users.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Use of the Service
            </h2>
            <p className="text-gray-600">
              BiteTrack is intended for personal use only. You agree not to misuse
              the platform or attempt to disrupt its functionality.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              User Accounts
            </h2>
            <p className="text-gray-600">
              You are responsible for maintaining the confidentiality of your account.
              Any activity performed using your account is your responsibility.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Data Responsibility
            </h2>
            <p className="text-gray-600">
              You are responsible for the data you enter into BiteTrack. We do not
              guarantee the accuracy of user-provided information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Service Availability
            </h2>
            <p className="text-gray-600">
              We aim to keep BiteTrack running smoothly, but we do not guarantee
              uninterrupted access at all times.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Changes to Terms
            </h2>
            <p className="text-gray-600">
              These terms may be updated in the future. Continued use of the service
              means you accept any changes.
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

export default Terms;
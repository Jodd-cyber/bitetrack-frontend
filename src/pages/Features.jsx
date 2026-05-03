import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Features() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 px-6 py-20"
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-2 group">
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
            Features
          </h1>
          <p className="text-gray-600 text-lg">
            Everything you can do with BiteTrack
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "📝",
              title: "Add Food Logs",
              desc: "Quickly add your meals with name, calories, and notes."
            },
            {
              icon: "📊",
              title: "View Your Ledger",
              desc: "See all your food records in a clean and organized way."
            },
            {
              icon: "✏️",
              title: "Edit Entries",
              desc: "Update your food logs anytime with correct details."
            },
            {
              icon: "🗑️",
              title: "Delete Records",
              desc: "Remove any entry permanently from your account."
            },
            {
              icon: "🔐",
              title: "User Authentication",
              desc: "Your data is private and tied to your personal account."
            },
            {
              icon: "⚡",
              title: "Fast & Simple UI",
              desc: "Designed for speed and ease of use with minimal effort."
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}

export default Features;
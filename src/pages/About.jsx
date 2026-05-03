import { motion } from "framer-motion";
import { Link } from "react-router-dom";


function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 px-6 py-20"
    >

<div className="max-w-6xl mx-auto mb-10 flex items-center justify-between">
  
  {/* Logo */}
  <Link to="/" className="flex items-center gap-2 group">
    <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-all">
      B
    </div>
    <span className="text-xl font-bold text-gray-900">BiteTrack</span>
  </Link>

  {/* Home Button */}
  <Link
    to="/"
    className="px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105"
  >
    ← Home
  </Link>

</div>
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About BiteTrack
          </h1>
          <p className="text-gray-600 text-lg">
            Built to simplify how you track your food and spending habits
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            BiteTrack is your personal food ledger — designed to help you
            track meals, analyze spending, and build better eating habits
            without any complexity.
          </p>

          <p className="text-gray-600 mb-4">
            Whether you're ordering from Swiggy, Zomato, or eating out locally,
            BiteTrack helps you understand your patterns and take control of
            your daily habits.
          </p>

          <p className="text-gray-600">
            This project is built using modern technologies like React,
            Node.js, and MongoDB, focusing on performance, simplicity,
            and a smooth user experience.
          </p>

        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: "Track Easily",
              desc: "Log your meals in seconds with a clean and simple interface",
              icon: "📊"
            },
            {
              title: "Stay Aware",
              desc: "Understand your spending and eating habits clearly",
              icon: "🧠"
            },
            {
              title: "Build Habits",
              desc: "Make smarter decisions and improve consistency",
              icon: "🎯"
            }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}

export default About;
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { parseApiResponse } from "../utils/apiResponse";
import getApiBase from "../utils/apiBase";

function Contact() {
  const [formData, setFormData] = useState({
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ FIXED: async function
  const handleSubmit = async (e) => {
    e.preventDefault();
    const API_BASE = getApiBase();

    try {
     const token = localStorage.getItem("bitetrack_token");

      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await parseApiResponse(res);

      if (data.success) {
        alert("Message sent successfully ✅");
        setFormData({ message: "" });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong ❌");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 px-6 py-20"
    >
      <div className="max-w-5xl mx-auto">

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

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-gray-600 text-lg">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Get in touch
            </h2>

            <p className="text-gray-600 mb-4">
              You can reach us directly via email:
            </p>

            <p className="text-gray-900 font-medium mb-6">
              📧 support@bitetrack.com
            </p>

            <p className="text-sm text-gray-500">
              We usually respond within 24 hours.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Send a message
            </h2>

            <div className="space-y-4">

              <textarea
                name="message"
                placeholder="Your Message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all"
              >
                Send Message
              </button>

            </div>
          </form>

        </div>
      </div>
    </motion.div>
  );
}

export default Contact;
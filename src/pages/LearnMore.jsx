import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

function LearnMore() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  return (
    <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.25 }}
>
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100 animate-slide-down">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              B
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              BiteTrack
            </h1>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="/signup" className="text-sm font-medium px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200">
              Get Started
            </a>
          </nav>
        </header>
        {/* Hero Section */}
        <section className="px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 mb-6 animate-fade-in">
            <span className="text-xs font-medium text-blue-700">📚 Complete Guide</span>
          </div>
          <h2 className="text-6xl font-bold text-gray-900 mb-6 animate-slide-up max-w-4xl mx-auto">
            Everything you need to know about{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BiteTrack
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-slide-up-delay-1">
            Your complete food order ledger — track every meal, manage expenses, and build better eating habits.
          </p>
        </section>
        {/* What is BiteTrack */}
        <section className="px-6 py-16">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">What is BiteTrack?</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  BiteTrack is your personal food order ledger that helps you keep track of every meal you order — whether it's from Zomato, Swiggy, local restaurants, or nearby eateries.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Think of it as your food diary meets expense tracker. Instead of wondering "Where did all my money go on food?", you'll have a clear, organized record of every order.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Perfect for food lovers, budget-conscious individuals, and anyone who wants to understand their eating patterns and spending habits.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                  <div className="space-y-4">
                    {[
                      { icon: '🍕', text: 'Log every food order', color: 'from-red-50 to-orange-50' },
                      { icon: '📍', text: 'Track order sources', color: 'from-blue-50 to-cyan-50' },
                      { icon: '💰', text: 'Monitor spending', color: 'from-green-50 to-emerald-50' },
                      { icon: '📊', text: 'Analyze patterns', color: 'from-purple-50 to-pink-50' },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 p-4 bg-gradient-to-r ${item.color} rounded-xl hover:scale-105 transition-transform cursor-pointer`}>
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium text-gray-900">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Why BiteTrack */}
        <section className="px-6 py-16">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Why use BiteTrack?</h3>
            <p className="text-gray-600 text-lg">Solve real problems with smart tracking</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '💸',
                title: 'Control Your Spending',
                desc: 'Stop wondering where your money goes. See exactly how much you spend on food orders daily, weekly, and monthly.',
                color: 'from-green-50 to-emerald-100'
              },
              {
                icon: '🎯',
                title: 'Build Better Habits',
                desc: 'Identify patterns in your ordering behavior. Are you ordering too often? Too late at night? BiteTrack helps you see it.',
                color: 'from-blue-50 to-cyan-100'
              },
              {
                icon: '📈',
                title: 'Track Favorite Places',
                desc: 'Remember that amazing restaurant? BiteTrack keeps a record of all your orders and favorite spots in one place.',
                color: 'from-purple-50 to-pink-100'
              },
              {
                icon: '🏆',
                title: 'Set Budget Goals',
                desc: 'Set monthly food budgets and get alerts when you\'re approaching your limit. Stay on track effortlessly.',
                color: 'from-yellow-50 to-orange-100'
              },
              {
                icon: '📱',
                title: 'Quick & Easy Logging',
                desc: 'Add orders in seconds. Just the essentials — restaurant name, amount, and date. That\'s it.',
                color: 'from-red-50 to-rose-100'
              },
              {
                icon: '🔐',
                title: 'Private & Secure',
                desc: 'Your data belongs to you. Everything is encrypted and stored securely. Export or delete anytime.',
                color: 'from-gray-50 to-slate-100'
              },
            ].map((item, i) => (
              <div key={i} className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
        {/* How It Works - Detailed */}
        <section className="px-6 py-16 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">How BiteTrack works</h3>
            <p className="text-gray-600 text-lg">Simple workflow, powerful results</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: '1',
                title: 'Order Food as Usual',
                desc: 'Continue ordering from your favorite platforms — Zomato, Swiggy, local restaurants, or anywhere else. Nothing changes in your routine.',
                icon: '🛵',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                step: '2',
                title: 'Log Your Order',
                desc: 'After you receive your order, quickly log it in BiteTrack. Add the restaurant name, amount spent, platform used, and any notes.',
                icon: '📝',
                color: 'from-purple-500 to-pink-500'
              },
              {
                step: '3',
                title: 'Track & Analyze',
                desc: 'Watch your order history build up. BiteTrack automatically calculates your spending, shows trends, and identifies your most frequent orders.',
                icon: '📊',
                color: 'from-green-500 to-emerald-500'
              },
              {
                step: '4',
                title: 'Make Better Decisions',
                desc: 'Use insights to make smarter choices. Set budgets, reduce unnecessary orders, and develop healthier eating habits.',
                icon: '🎯',
                color: 'from-orange-500 to-red-500'
              },
            ].map((item, i) => (
              <div key={i} className="group relative">
                <div className="flex gap-6 items-start">
                  <div className={`relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {item.icon}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-900 shadow-md">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Use Cases */}
        <section className="px-6 py-16">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Perfect for everyone</h3>
            <p className="text-gray-600 text-lg">See how different people use BiteTrack</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                persona: '🎓 Students',
                title: 'Manage Limited Budget',
                desc: 'Track hostel food, mess meals, and outside orders. Stay within your monthly allowance and avoid overspending.',
                highlight: 'Budget tracking'
              },
              {
                persona: '💼 Professionals',
                title: 'Organize Work Expenses',
                desc: 'Log office lunch orders, client dinners, and business meals. Separate personal and work food expenses easily.',
                highlight: 'Expense categorization'
              },
              {
                persona: '👨‍👩‍👧‍👦 Families',
                title: 'Track Household Orders',
                desc: 'Monitor family food spending across all platforms. See which restaurants you order from most and optimize costs.',
                highlight: 'Family insights'
              },
            ].map((useCase, i) => (
              <div key={i} className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-900 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{useCase.persona}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{useCase.title}</h4>
                <p className="text-gray-600 mb-4 leading-relaxed">{useCase.desc}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                  ✓ {useCase.highlight}
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Key Features Deep Dive */}
        <section className="px-6 py-16 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Features that make a difference</h3>
            <p className="text-gray-600 text-lg">Designed for real-world food tracking</p>
          </div>
          <div className="max-w-5xl mx-auto space-y-6">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast Entry',
                features: ['Add orders in under 10 seconds', 'Smart autocomplete for restaurants', 'Recent orders quick-add', 'Voice input support']
              },
              {
                icon: '🏪',
                title: 'Multi-Platform Support',
                features: ['Zomato orders tracking', 'Swiggy orders tracking', 'Local restaurant orders', 'Home delivery from anywhere']
              },
              {
                icon: '💳',
                title: 'Smart Expense Tracking',
                features: ['Automatic daily/weekly/monthly totals', 'Category-wise spending breakdown', 'Budget alerts and notifications', 'Export to Excel/CSV']
              },
              {
                icon: '📊',
                title: 'Powerful Analytics',
                features: ['Most ordered restaurants', 'Average order value', 'Peak ordering times', 'Monthly spending trends']
              },
            ].map((feature, i) => (
              <div key={i} className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {feature.features.map((item, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Common questions</h3>
              <p className="text-gray-600 text-lg">Everything you need to know</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: 'Do I need to connect my Zomato or Swiggy account?',
                  a: 'No! BiteTrack is a manual logging system. You simply record your orders after you receive them. This gives you complete privacy and works with any food source — not just apps.'
                },
                {
                  q: 'How long does it take to log an order?',
                  a: 'Less than 10 seconds! Just enter the restaurant name, amount, and platform. The date is automatically set to today, and you can add optional notes if needed.'
                },
                {
                  q: 'Can I track orders from local restaurants?',
                  a: 'Absolutely! BiteTrack works with any food source — app-based deliveries, local restaurants, street food, home deliveries, or even groceries. Track everything in one place.'
                },
                {
                  q: 'Is my data private and secure?',
                  a: 'Yes! Your data is encrypted and stored securely. We never share your information with third parties. You can export or delete all your data anytime.'
                },
                {
                  q: 'Can I set spending limits?',
                  a: 'Yes! Set daily, weekly, or monthly budgets. BiteTrack will notify you when you\'re approaching your limit, helping you stay on track with your financial goals.'
                },
                {
                  q: 'Is BiteTrack free to use?',
                  a: 'Yes! BiteTrack is completely free to start. You can log unlimited orders, track spending, and view basic analytics at no cost.'
                },
              ].map((faq, i) => (
                <div key={i} className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                    <span className="text-blue-500 flex-shrink-0">Q.</span>
                    {faq.q}
                  </h4>
                  <p className="text-gray-600 leading-relaxed pl-5">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-16 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50 animate-gradient bg-[length:200%_auto]"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float-delay" />
            <div className="relative text-center">
              <h3 className="text-5xl font-bold mb-4">Ready to start tracking?</h3>
              <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-10">
                Join thousands who are taking control of their food spending. Get started in less than a minute.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button className="group inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-base font-medium text-gray-900 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300">
                  Create Free Account
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="text-base text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  View demo
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="px-6 py-12 border-t border-gray-200/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-gray-900 to-gray-700 rounded-md flex items-center justify-center text-white text-xs font-bold">
                B
              </div>
              <span className="text-sm text-gray-600">© 2026 BiteTrack. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <button onClick={() => setShowPrivacy(true)} className="hover:text-gray-900 transition-colors">Privacy</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-gray-900 transition-colors">Terms</button>
              <button onClick={() => setShowContact(true)} className="hover:text-gray-900 transition-colors">Contact</button>
            </div>
          </div>
        </footer>
      </div>
    </div>

      {/* ────── TERMS MODAL ────── */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowTerms(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white w-[90%] max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Terms & Conditions</h2>
              <button onClick={() => setShowTerms(false)} className="text-2xl text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-gray-600">
              <p className="text-gray-700">By using BiteTrack, you agree to the following terms and conditions.</p>
              <div><h3 className="font-semibold text-gray-900 mb-1">1. Service Usage</h3><p>BiteTrack is provided as-is for personal food tracking. Users must use the service responsibly and not for any harmful purposes.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">2. User Responsibilities</h3><p>Users are responsible for maintaining the confidentiality of their account credentials and all activities under their account.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">3. Acceptable Use</h3><p>You agree not to use BiteTrack for any illegal activities, harassment, or any behavior that violates our community standards.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">4. Data Accuracy</h3><p>While we strive for accuracy, all calorie and nutritional information is approximate. Always consult professional nutritionists for medical advice.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">5. Limitation of Liability</h3><p>BiteTrack is not responsible for any indirect, incidental, or consequential damages arising from your use of our service.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">6. Changes to Terms</h3><p>These terms may be updated in the future. Continued use of the service means you accept any changes.</p></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowTerms(false)} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800">Got it</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ────── PRIVACY MODAL ────── */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowPrivacy(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white w-[90%] max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Privacy Policy</h2>
              <button onClick={() => setShowPrivacy(false)} className="text-2xl text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-gray-600">
              <p className="text-gray-700">BiteTrack respects your privacy and is committed to protecting your personal data.</p>
              <div><h3 className="font-semibold text-gray-900 mb-1">1. Information We Collect</h3><p>We collect basic account information such as your name, email, and food log data that you voluntarily add to the platform.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">2. How We Use Your Data</h3><p>Your data is used exclusively to provide BiteTrack services. We do not sell, share, or trade your personal information with third parties.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">3. Data Security</h3><p>We implement industry-standard security measures to protect your data from unauthorized access or disclosure.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">4. Cookies and Tracking</h3><p>We may use cookies for authentication and improving user experience. You can disable cookies in your browser settings.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">5. Your Rights</h3><p>You have the right to access, modify, or delete your personal data at any time by contacting us or through your account settings.</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-1">6. Contact Us</h3><p>If you have questions about this Privacy Policy, please contact us at privacy@bitetrack.com.</p></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowPrivacy(false)} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800">Got it</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ────── CONTACT MODAL ────── */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowContact(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white w-[90%] max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Contact Us</h2>
              <button onClick={() => setShowContact(false)} className="text-2xl text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-gray-600">
              <h3 className="font-semibold text-gray-900">Have questions or feedback?</h3>
              <p>We'd love to hear from you. You can reach us directly via email:</p>
              <p className="text-gray-900 font-medium text-base">📧 support@bitetrack.com</p>
              <p className="text-xs text-gray-500">We usually respond within 24 hours.</p>
              <div className="pt-4"><h3 className="font-semibold text-gray-900 mb-2">What's on your mind?</h3><p>Whether it's a feature request, bug report, or general feedback, we're listening. Help us make BiteTrack better for everyone.</p></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowContact(false)} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800">Got it</button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}
export default LearnMore;

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';




function Ledger() {
  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
  const STORAGE_KEY = 'bitetrack_records';

  const readApiBody = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  };

  const defaultRecords = [
    {
      id: '1',
      foodName: 'Paneer Wrap',
      restaurant: 'Swiggy - Wrap House',
      date: '2026-01-15',
      time: '13:30',
      mealType: 'Lunch',
      amount: 180,
      rating: 4,
      notes: 'Extra spicy'
    },
    {
      id: '2',
      foodName: 'Margherita Pizza',
      restaurant: 'Zomato - Dominos',
      date: '2026-01-14',
      time: '20:15',
      mealType: 'Dinner',
      amount: 499,
      rating: 5
    },
    {
      id: '3',
      foodName: 'Masala Dosa',
      restaurant: 'Local - Sagar Ratna',
      date: '2026-01-14',
      time: '09:00',
      mealType: 'Breakfast',
      amount: 120,
      rating: 5
    }
  ];

  const [records, setRecords] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultRecords;
    } catch (e) {
      return defaultRecords;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
const fetchLogs = async () => {
  try {
    setLoading(true);
    setError("");

   const token = localStorage.getItem("token");

    const res = await fetch("https://bitetrack-backend-yfkf.onrender.com/api/foodlogs", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await readApiBody(res);

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch");
    }

    const formatted = data.map(log => ({
  id: log._id,
  foodName: log.items?.[0]?.name || "Food",
  restaurant: log.restaurant || "Custom Entry",

  date: log.date
    ? new Date(log.date).toISOString().split('T')[0]
    : "",

  time: log.time || "",

  mealType: log.mealType || "Lunch",

  amount: log.items?.[0]?.calories || 0,

  rating: Number(log.rating) || 0,   // ✅ FIXED

  notes: log.notes || ""
}));

    setRecords(formatted);

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  fetchLogs();
}, []);

  // persist records so deletes/adds survive navigation
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMealType, setFilterMealType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Monthly Budget
  const monthlyBudget = parseInt(localStorage.getItem("bitetrack_monthly_budget") || "0");
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySpent = records.reduce((sum, record) => {
    const recordDate = new Date(record.date);
    if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
      return sum + record.amount;
    }
    return sum;
  }, 0);
  const budgetRemaining = monthlyBudget - monthlySpent;
  const budgetPercent = monthlyBudget > 0 ? Math.min((monthlySpent / monthlyBudget) * 100, 100) : 0;
  // Form state
  const [formData, setFormData] = useState({
    foodName: '',
    restaurant: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    mealType: 'Lunch',
    amount: '',
    rating: 0,
    notes: ''
    
  });

  
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const mealIcons = {
    Breakfast: '🌅',
    Lunch: '🌞',
    Dinner: '🌙',
    Snack: '🍿'
  };
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");
    const url = editingId
      ? `https://bitetrack-backend-yfkf.onrender.com/api/foodlogs/${editingId}`
      : `https://bitetrack-backend-yfkf.onrender.com/api/foodlogs`;

    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          {
            name: formData.foodName,
            calories: Number(formData.amount),
            quantity: 1
          }
        ],
        notes: formData.notes,
        restaurant: formData.restaurant,
        mealType: formData.mealType,
        date: formData.date,
        time: formData.time,
        rating: Number(formData.rating)   // ✅ IMPORTANT
      })
    });

    const data = await readApiBody(response);

    if (!response.ok) {
      throw new Error(data.message || "Save failed");
    }

    const newRecord = {
      id: data._id,
      foodName: data.items?.[0]?.name || "Food",
      restaurant: data.restaurant || "Custom Entry",

      date: data.date
        ? new Date(data.date).toISOString().split('T')[0]
        : "",

      time: data.time || "",
      mealType: data.mealType || "Lunch",

      amount: data.items?.[0]?.calories || 0,
      rating: Number(data.rating) || 0,   // ✅ IMPORTANT
      notes: data.notes || ""
    };

    const nextRecords = editingId
      ? records.map(r => (r.id === editingId ? newRecord : r))
      : [newRecord, ...records];

    setRecords(nextRecords);

    if (editingId) {
      setEditingId(null);
    }

    setShowAddForm(false);

  } catch (err) {
    console.error("Error:", err);
  }
};
  const handleEdit = (record) => {
    setFormData({
      foodName: record.foodName,
      restaurant: record.restaurant,
      date: record.date,
      time: record.time,
      mealType: record.mealType,
      amount: record.amount.toString(),
      rating: record.rating || 0,
      notes: record.notes || ''
    });
    setEditingId(record.id);
    setShowAddForm(true);
  };
  const handleDelete = async (id) => {
  try {
    const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

    await fetch(`https://bitetrack-backend-yfkf.onrender.com/api/foodlogs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // refresh after delete
    setRecords(records.filter(r => r.id !== id));

  } catch (err) {
    console.error("Delete failed:", err);
  }
};
  // Filter and sort records
const filteredRecords = records
  .filter(r => {
    const matchesSearch =
      r.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.restaurant.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMealType =
      filterMealType === 'all' || r.mealType === filterMealType;

    const recordDate = new Date(r.date);
    recordDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let matchesDate = true;

    // ✅ TODAY
    if (dateFilter === 'today') {
      matchesDate =
        recordDate.toDateString() === today.toDateString();
    }

    // ✅ CURRENT WEEK
    else if (dateFilter === 'week') {
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);

      matchesDate = recordDate >= firstDayOfWeek;
    }

    // ✅ CURRENT MONTH
    else if (dateFilter === 'month') {
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      matchesDate = recordDate >= firstDayOfMonth;
    }

    return matchesSearch && matchesMealType && matchesDate;
  })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime();
      } else {
        return b.amount - a.amount;
      }
    });
  // Calculate statistics
  const totalSpent = filteredRecords.reduce((sum, r) => sum + r.amount, 0);
  const orderCount = filteredRecords.length;
  const topRestaurant = records.length > 0
    ? Object.entries(
        records.reduce((acc, r) => {
          acc[r.restaurant] = (acc[r.restaurant] || 0) + 1;
          return acc;
        }, {})
      ).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
    : 'N/A';

  const getTopLabels = (counts, emptyLabel = 'N/A') => {
    const entries = Object.entries(counts);

    if (entries.length === 0) {
      return emptyLabel;
    }

    const topCount = Math.max(...entries.map(([, count]) => count));
    const leaders = entries
      .filter(([, count]) => count === topCount)
      .map(([label]) => label);

    return leaders.length === 1 ? leaders[0] : leaders.join(' / ');
  };

  const peakRecords = filteredRecords;
  const mealWindowCounts = peakRecords.reduce((acc, record) => {
    const mealWindow = record.mealType || 'Lunch';
    acc[mealWindow] = (acc[mealWindow] || 0) + 1;
    return acc;
  }, {});

  const topMealWindow = getTopLabels(mealWindowCounts);

  const weekdayCount = peakRecords.filter((record) => {
    const day = new Date(record.date).getDay();
    return day >= 1 && day <= 5;
  }).length;

  const weekendCount = peakRecords.filter((record) => {
    const day = new Date(record.date).getDay();
    return day === 0 || day === 6;
  }).length;

  const peakPeriodLabel = weekendCount > weekdayCount
    ? 'Weekends'
    : weekdayCount > weekendCount
      ? 'Weekdays'
      : 'Balanced';

if (loading) {







  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Loading your data...
    </div>
  );
}

const chartData = records.reduce((acc, record) => {
  const date = record.date;

  const existing = acc.find(item => item.date === date);

  if (existing) {
    existing.amount += record.amount;
  } else {
    acc.push({ date, amount: record.amount });
  }

  return acc;
}, []);


  return (
    <div className="min-h-screen bg-[var(--app-bg)] overflow-hidden">
      {error && (
  <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
    {error}
  </div>
)}
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 bg-[var(--app-surface)]/80 backdrop-blur-xl border-b border-[var(--app-border)] shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                B
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                BiteTrack
              </h1>
            </Link>
            {/* Date Filter */}
            <div className="flex items-center gap-2">
              {['today', 'week', 'month', 'all'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    dateFilter === filter
                      ? 'bg-gray-900 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            {/* Home button (replace logout on Ledger page) */}
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75zM9 22V12h6v10" />
              </svg>
              Home
            </Link>
          </div>
        </div>
      </motion.header>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Dashboard */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Spent */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">Total Spent</span>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">₹{totalSpent.toFixed(2)}</div>
            <div className="text-blue-100 text-sm">{dateFilter === 'all' ? 'All time' : `This ${dateFilter}`}</div>
          </motion.div>

<div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-200">
  <h2 className="text-lg font-semibold mb-4 text-gray-800">
    Spending Overview
  </h2>

  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={chartData}>
      
      <XAxis
        dataKey="date"
        tick={{ fontSize: 12, fill: "#6B7280" }}
        axisLine={false}
        tickLine={false}
      />

      <YAxis
        tick={{ fontSize: 12, fill: "#6B7280" }}
        axisLine={false}
        tickLine={false}
      />

      <Tooltip
        contentStyle={{
          borderRadius: "10px",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}
        formatter={(value) => [`₹${value}`, "Amount"]}
      />

      <Bar
        dataKey="amount"
        fill="#6366F1"
        radius={[8, 8, 0, 0]}
      />

    </BarChart>
  </ResponsiveContainer>
</div>

          {/* Order Count */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-sm font-medium">Total Orders</span>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <span className="text-2xl">📦</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{orderCount}</div>
            <div className="text-purple-100 text-sm">
              {orderCount > 0 ? `Avg: ₹${(totalSpent / orderCount).toFixed(0)}` : 'No orders yet'}
            </div>
          </motion.div>
          {/* Top Restaurant */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">Top Restaurant</span>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <div className="text-xl font-bold mb-1 truncate">{topRestaurant}</div>
            <div className="text-green-100 text-sm">Most ordered from</div>
          </motion.div>
        </motion.div>

        {/* Monthly Budget Card */}
        {monthlyBudget > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Budget</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                budgetRemaining >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {budgetRemaining >= 0 ? '✓ On Track' : '⚠ Over Budget'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Budget</p>
                <p className="text-2xl font-bold text-gray-900">₹{monthlyBudget}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Spent This Month</p>
                <p className="text-2xl font-bold text-gray-900">₹{monthlySpent}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Remaining</p>
                <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(budgetRemaining)}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetPercent}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${
                  budgetRemaining >= 0
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{budgetPercent.toFixed(0)}% of budget used</p>
          </motion.div>
        )}

        {/* Peak Ordering Times */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Peak Ordering Times</h3>
            <span className="text-sm text-gray-500">Based on current view</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Top meal window</p>
              <p className="text-xl font-bold text-gray-900">{topMealWindow}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Weekend or weekday</p>
              <p className="text-xl font-bold text-gray-900">{peakPeriodLabel}</p>
              <p className="text-sm text-gray-500 mt-1">
                {weekendCount} weekend / {weekdayCount} weekday orders
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add Form & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Record Button */}
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                setFormData({
                  foodName: '',
                  restaurant: '',
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toTimeString().slice(0, 5),
                  mealType: 'Lunch',
                  amount: '',
                  rating: 0,
                  notes: ''
                });
              }}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-lg font-bold">Add New Order</span>
            </motion.button>
            {/* Add/Edit Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingId ? '✏️ Edit Order' : '➕ New Order'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingId(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Food Name */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Food Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.foodName}
                        onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                        placeholder="e.g., Paneer Wrap"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    {/* Restaurant */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant / Source *</label>
                      <input
                        type="text"
                        required
                        value={formData.restaurant}
                        onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                        placeholder="e.g., Swiggy - Dominos"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                        <input
                          type="time"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                    {/* Meal Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {mealTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, mealType: type })}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                              formData.mealType === type
                                ? 'bg-gray-900 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <span>{mealIcons[type]}</span>
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount Spent (₹) *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="150.00"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    {/* Rating */}
                    <div className="mt-3">
  <label className="text-sm text-gray-600">Rating</label>

  <div className="flex gap-2 mt-1">
    {[1,2,3,4,5].map(star => (
      <span
        key={star}
        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
        className="cursor-pointer text-xl"
      >
        {star <= formData.rating ? "⭐" : "☆"}
      </span>
    ))}
  </div>
</div>
                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="e.g., Extra spicy, shared with friend"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 resize-none"
                      />
                    </div>
                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {editingId ? '💾 Update Order' : '✅ Add Order'}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🔍</span>
                Filters & Search
              </h3>
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search food or restaurant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
              {/* Meal Type Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                <select
                  value={filterMealType}
                  onChange={(e) => setFilterMealType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200"
                >
                  <option value="all">All Meals</option>
                  {mealTypes.map((type) => (
                    <option key={type} value={type}>{mealIcons[type]} {type}</option>
                  ))}
                </select>
              </div>
              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all duration-200"
                >
                  <option value="date">📅 Newest First</option>
                  <option value="amount">💰 Amount (High to Low)</option>
                </select>
              </div>
            </motion.div>
          </div>
          {/* Right Column - Records List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>📋</span>
                  Order History
                  <span className="text-lg font-normal text-gray-500">({filteredRecords.length})</span>
                </h2>
              </div>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredRecords.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300"
                    >
                      <div className="text-6xl mb-4">🍽️</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                      <p className="text-gray-600">Add your first order to start tracking!</p>
                    </motion.div>
                  ) : (
                    filteredRecords.map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-3xl">{mealIcons[record.mealType]}</span>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                                  {record.foodName}
                                </h3>
                                <p className="text-sm text-gray-600">{record.restaurant}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </div>
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {record.time}
                              </div>
                              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                                {record.mealType}
                              </span>
                            </div>
                            
                              <div className="flex gap-1 mt-2">
  {[1,2,3,4,5].map(star => (
    <span key={star}>
      {star <= Number(record.rating || 0) ? "⭐" : "☆"}
    </span>
  ))}
</div>
                            
                            {record.notes && (
                              <p className="mt-2 text-sm text-gray-600 italic">💬 {record.notes}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <div className="text-2xl font-bold text-green-600">
                              ₹{record.amount.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(record)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(record.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Ledger;

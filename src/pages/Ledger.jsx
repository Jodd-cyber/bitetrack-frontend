import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import getApiBase from '../utils/apiBase';
import SleekSelect from '../components/SleekSelect';
import SleekDatePicker from '../components/SleekDatePicker';
import SleekTimePicker from '../components/SleekTimePicker';
import Loader from '../components/Loader';

function Ledger() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const API_BASE = getApiBase();
  const [loading, setLoading] = useState(false);
  const [, setError] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const STORAGE_KEY = `bitetrack_records_${user?.id || 'anon'}`;
  
  const getBudgetStorageKey = () => {
    return `bitetrack_monthly_budget_${user?.id || 'temp'}`;
  };

  const readApiBody = async (response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const formatReportDate = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getReportScopeRecords = (scope) => {
    if (scope === 'month') {
      const now = new Date();
      return records.filter((record) => {
        const recordDate = new Date(record.date);
        return (
          !Number.isNaN(recordDate.getTime()) &&
          recordDate.getMonth() === now.getMonth() &&
          recordDate.getFullYear() === now.getFullYear()
        );
      });
    }
    return records;
  };

  const getReportTopRestaurant = (reportRecords) => {
    if (reportRecords.length === 0) return 'N/A';
    const restaurantTotals = reportRecords.reduce((accumulator, record) => {
      const restaurant = record.restaurant || 'Unknown';
      accumulator[restaurant] = (accumulator[restaurant] || 0) + Number(record.amount || 0);
      return accumulator;
    }, {});
    return Object.entries(restaurantTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  };

  const downloadReportPdf = (scope) => {
    const reportRecords = getReportScopeRecords(scope);
    if (reportRecords.length === 0) {
      alert(scope === 'month' ? 'No orders found for this month.' : 'No orders found to export.');
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const sortedRecords = [...reportRecords].sort((a, b) => {
        const left = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
        const right = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        return left - right;
      });
      const totalOrders = sortedRecords.length;
      const totalSpent = sortedRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
      const topRestaurant = getReportTopRestaurant(sortedRecords);
      const now = new Date();
      const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      const reportLabel = scope === 'month' ? monthLabel : 'All Time';
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      const summaryTop = 34;
      const cardGap = 5;
      const cardWidth = (pageWidth - margin * 2 - cardGap * 2) / 3;
      const cardHeight = 20;

      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(scope === 'month' ? 'BiteTrack Monthly Report' : 'BiteTrack Order Report', margin, 18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Period: ${reportLabel}`, margin, 26);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - margin, 26, { align: 'right' });

      const summaryCards = [
        { label: 'Total Orders', value: String(totalOrders) },
        { label: 'Total Spent', value: formatCurrency(totalSpent) },
        { label: 'Top Restaurant', value: topRestaurant }
      ];

      summaryCards.forEach((card, index) => {
        const x = margin + index * (cardWidth + cardGap);
        doc.setDrawColor(229, 231, 235);
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(x, summaryTop, cardWidth, cardHeight, 3, 3, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(card.label, x + 4, summaryTop + 7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text(card.value, x + 4, summaryTop + 14);
      });

      autoTable(doc, {
        startY: summaryTop + cardHeight + 10,
        head: [['Date', 'Food', 'Restaurant', 'Meal Type', 'Amount']],
        body: sortedRecords.map((record) => [
          formatReportDate(record.date),
          record.foodName || 'Food',
          record.restaurant || 'Custom Entry',
          record.mealType || 'Lunch',
          formatCurrency(record.amount)
        ]),
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3, valign: 'middle', overflow: 'linebreak' },
        headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 48 },
          2: { cellWidth: 85 },
          3: { cellWidth: 28 },
          4: { halign: 'right', cellWidth: 28 }
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(107, 114, 128);
          doc.text(`Page ${data.pageNumber}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
        }
      });

      const fileName = scope === 'month'
        ? `bitetrack-monthly-report-${now.toISOString().slice(0, 7)}.pdf`
        : 'bitetrack-all-orders-report.pdf';
      doc.save(fileName);
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      alert('Could not generate the PDF report.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const defaultRecords = [
    { id: '1', foodName: 'Paneer Wrap', restaurant: 'Swiggy - Wrap House', date: '2026-01-15', time: '13:30', mealType: 'Lunch', amount: 180, rating: 4, notes: 'Extra spicy' },
    { id: '2', foodName: 'Margherita Pizza', restaurant: 'Zomato - Dominos', date: '2026-01-14', time: '20:15', mealType: 'Dinner', amount: 499, rating: 5 },
    { id: '3', foodName: 'Masala Dosa', restaurant: 'Local - Sagar Ratna', date: '2026-01-14', time: '09:00', mealType: 'Breakfast', amount: 120, rating: 5 }
  ];

  const [records, setRecords] = useState(() => {
    try {
      if (user) return [];
      const raw = localStorage.getItem('bitetrack_records_anon') || localStorage.getItem('bitetrack_records');
      return raw ? JSON.parse(raw) : defaultRecords;
    } catch {
      return user ? [] : defaultRecords;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records, STORAGE_KEY]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          setRecords(user ? [] : records);
          setLoading(false);
          return;
        }
        try {
          localStorage.removeItem('bitetrack_records');
          localStorage.removeItem('bitetrack_records_anon');
        } catch { void 0; }
        setRecords([]);
        const res = await fetch(`${API_BASE}/api/foodlogs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await readApiBody(res);
        if (!res.ok) {
          setRecords([]);
          throw new Error(data.message || "Failed to fetch");
        }
        if (!Array.isArray(data)) throw new Error('Expected array from API');
        const formatted = data.map(log => ({
          id: log._id,
          foodName: log.items?.[0]?.name || "Food",
          restaurant: log.restaurant || "Custom Entry",
          date: log.date ? new Date(log.date).toISOString().split('T')[0] : "",
          time: log.time || "",
          mealType: log.mealType || "Lunch",
          amount: Number(log.amount ?? (log.items?.[0]?.calories || 0)),
          rating: Number(log.rating) || 0,
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
  }, [user]);

  const [budget, setBudget] = useState(() => {
    try {
      const budgetKey = `bitetrack_monthly_budget_${user?.id || 'temp'}`;
      const raw = localStorage.getItem(budgetKey);
      return raw ? { amount: Number(raw) } : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/budget`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) setBudget(data.data);
      } catch (err) {
        console.error("Budget fetch failed:", err);
      }
    };
    fetchBudget();
  }, [user]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [saveForAllMonths, setSaveForAllMonths] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMealType, setFilterMealType] = useState('all');
  const [dateFilter, setDateFilter] = useState(() => {
    try {
      const filterKey = `bitetrack_date_filter_${user?.id || 'temp'}`;
      return localStorage.getItem(filterKey) || 'all';
    } catch {
      return 'all';
    }
  });
  const [sortBy, setSortBy] = useState('date');

  // Persist date filter choice
  useEffect(() => {
    try {
      const filterKey = `bitetrack_date_filter_${user?.id || 'temp'}`;
      localStorage.setItem(filterKey, dateFilter);
    } catch (err) {
      console.error("Failed to save date filter:", err);
    }
  }, [dateFilter, user?.id]);

  const monthlyBudget = budget?.amount || 0;
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

  useEffect(() => {
    const budgetKey = getBudgetStorageKey();
    if (budget && Number(budget.amount) > 0) {
      localStorage.setItem(budgetKey, String(Number(budget.amount)));
    } else {
      localStorage.removeItem(budgetKey);
    }
  }, [budget, user?.id]);


  const [formData, setFormData] = useState({
    foodName: '',
    restaurant: '',
    date: (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    time: new Date().toTimeString().slice(0, 5),
    mealType: 'Lunch',
    amount: '',
    rating: 0,
    notes: ''
  });

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const mealIcons = { Breakfast: '🌅', Lunch: '🌞', Dinner: '🌙', Snack: '🍿' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Future date check
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        alert("You cannot add or edit orders for future dates.");
        return;
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      let finalRecord;
      
      if (token && user) {
        // Signed-in mode: Save to API
        const url = editingId ? `${API_BASE}/api/foodlogs/${editingId}` : `${API_BASE}/api/foodlogs`;
        const method = editingId ? "PUT" : "POST";
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            items: [{ name: formData.foodName, quantity: 1 }],
            amount: Number(formData.amount || 0),
            notes: formData.notes,
            restaurant: formData.restaurant,
            mealType: formData.mealType,
            date: formData.date,
            time: formData.time,
            rating: Number(formData.rating)
          })
        });
        const data = await readApiBody(response);
        if (!response.ok) throw new Error(data.message || "Save failed");
        
        finalRecord = {
          id: data._id || data.id,
          foodName: data.items?.[0]?.name || "Food",
          restaurant: data.restaurant || "Custom Entry",
          date: data.date ? (data.date.includes('T') ? data.date.split('T')[0] : data.date) : "",
          time: data.time || "",
          mealType: data.mealType || "Lunch",
          amount: Number(data.amount ?? 0),
          rating: Number(data.rating) || 0,
          notes: data.notes || ""
        };
      } else {
        // Guest mode: Save locally
        finalRecord = {
          id: editingId || Date.now().toString(),
          foodName: formData.foodName,
          restaurant: formData.restaurant,
          date: formData.date,
          time: formData.time,
          mealType: formData.mealType,
          amount: Number(formData.amount || 0),
          rating: Number(formData.rating) || 0,
          notes: formData.notes
        };
      }

      const nextRecords = editingId 
        ? records.map(r => (String(r.id) === String(editingId) ? finalRecord : r)) 
        : [finalRecord, ...records];
      
      setRecords(nextRecords);
      setEditingId(null);
      setShowAddForm(false);
      
      // Optional: Success feedback
      // alert(editingId ? "Order updated successfully!" : "Order added successfully!");
    } catch (err) {
      console.error("Error saving record:", err);
      alert(err.message || "Failed to save record. Please try again.");
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
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token && user) {
        await fetch(`${API_BASE}/api/foodlogs/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setRecords(records.filter(r => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record. Please try again.");
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.foodName.toLowerCase().includes(searchQuery.toLowerCase()) || r.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMealType = filterMealType === 'all' || r.mealType === filterMealType;
    const recordDate = new Date(r.date);
    recordDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = recordDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);
      matchesDate = recordDate >= firstDayOfWeek;
    } else if (dateFilter === 'month') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      matchesDate = recordDate >= firstDayOfMonth;
    }
    return matchesSearch && matchesMealType && matchesDate;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime();
    } else {
      return b.amount - a.amount;
    }
  });

  const hasNoOrders = records.length === 0;
  const hasActiveFilters = searchQuery.trim().length > 0 || filterMealType !== 'all' || dateFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setFilterMealType('all');
    setDateFilter('all');
  };

  const openNewOrderForm = () => {
    setShowAddForm(true);
    setEditingId(null);
    setFormData({
      foodName: '',
      restaurant: '',
      date: (() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
      time: new Date().toTimeString().slice(0, 5),
      mealType: 'Lunch',
      amount: '',
      rating: 0,
      notes: ''
    });
  };

  const handleScanReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64data = reader.result;
          const base64String = base64data.split(',')[1];
          
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
          const res = await fetch(`${API_BASE}/api/ai/scan-receipt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              imageBase64: base64String,
              mimeType: file.type
            })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to scan receipt');

          const scanData = data.data;
          
          openNewOrderForm();
          setFormData(prev => ({
            ...prev,
            restaurant: scanData.restaurant || '',
            date: scanData.date || prev.date,
            amount: scanData.amount || '',
            foodName: scanData.items && scanData.items.length > 0 
              ? scanData.items.map(i => i.name).join(', ') 
              : '',
            notes: scanData.items && scanData.items.length > 0 
              ? 'Estimated Calories:\n' + scanData.items.map(i => `- ${i.name}: ${i.calories || 'Unknown'} kcal`).join('\n')
              : ''
          }));
        } catch (err) {
          console.error(err);
          alert('Error scanning receipt: ' + err.message);
        } finally {
          setIsScanning(false);
          e.target.value = '';
        }
      };
    } catch (err) {
      console.error(err);
      alert('Error reading file');
      setIsScanning(false);
      e.target.value = '';
    }
  };

  const totalSpent = filteredRecords.reduce((sum, r) => sum + r.amount, 0);
  const orderCount = filteredRecords.length;
  const topRestaurant = filteredRecords.length > 0
    ? Object.entries(filteredRecords.reduce((acc, r) => {
        acc[r.restaurant] = (acc[r.restaurant] || 0) + r.amount;
        return acc;
      }, {})).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"
    : "N/A";

  const getTopLabels = (counts, emptyLabel = 'N/A') => {
    const entries = Object.entries(counts);
    if (entries.length === 0) return emptyLabel;
    const topCount = Math.max(...entries.map(([, count]) => count));
    const leaders = entries.filter(([, count]) => count === topCount).map(([label]) => label);
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
  const peakPeriodLabel = weekendCount > weekdayCount ? 'Weekends' : weekdayCount > weekendCount ? 'Weekdays' : 'Balanced';

  const chartData = filteredRecords.reduce((acc, record) => {
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
    <div className={`min-h-screen bg-[var(--app-bg)] ${loading ? 'overflow-hidden' : ''}`}>
      {loading && <Loader text="Loading your data..." />}

      {/* ═══════════════════════════════════════════════════
          ENHANCED HEADER
      ═══════════════════════════════════════════════════ */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 bg-[var(--app-surface)]/95 backdrop-blur-xl border-b border-[var(--app-border)] shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group self-start">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                  B
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--app-text)]">BiteTrack</h1>
                <p className="text-xs text-[var(--app-text-muted)]">Your Food Ledger</p>
              </div>
            </Link>

            {/* Date Filter Pills */}
            <div className="flex flex-wrap items-center gap-3">
              {['today', 'week', 'month', 'all'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`pressed-btn ${dateFilter === filter ? 'active' : ''}`}
                >
                  <div className="pressed-btn-outer">
                    <div className="pressed-btn-inner">
                      <span>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Home Button */}
            <Link
              to="/"
              className="pressed-btn"
              style={{ textDecoration: 'none' }}
            >
              <div className="pressed-btn-outer">
                <div className="pressed-btn-inner">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--pressed-text-start)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {/* ═══════════════════════════════════════════════════
            ENHANCED STATS CARDS
        ═══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Spent Card */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="w-20 h-20 bg-white/10 rounded-full blur-2xl absolute top-0 right-0"></div>
              </div>
              <p className="text-blue-100 text-sm font-medium mb-2">Total Spent</p>
              <h3 className="text-3xl font-bold mb-1">
                {orderCount > 0 ? formatCurrency(totalSpent) : 'No spend yet'}
              </h3>
              <p className="text-blue-100 text-sm">{dateFilter === 'all' ? 'All time' : `This ${dateFilter}`}</p>
            </div>
          </motion.div>

          {/* Order Count Card */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="w-20 h-20 bg-white/10 rounded-full blur-2xl absolute top-0 right-0"></div>
              </div>
              <p className="text-purple-100 text-sm font-medium mb-2">Total Orders</p>
              <h3 className="text-3xl font-bold mb-1">
                {orderCount > 0 ? orderCount : 'No orders yet'}
              </h3>
              <p className="text-purple-100 text-sm">
                {orderCount > 0 ? `Avg: ${formatCurrency(totalSpent / orderCount)}` : 'Get started'}
              </p>
            </div>
          </motion.div>

          {/* Top Restaurant Card */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="w-20 h-20 bg-white/10 rounded-full blur-2xl absolute top-0 right-0"></div>
              </div>
              <p className="text-green-100 text-sm font-medium mb-2">Top Restaurant</p>
              <h3 className="text-xl font-bold mb-1 truncate">
                {orderCount > 0 ? topRestaurant : 'Not enough data'}
              </h3>
              <p className="text-green-100 text-sm">Most ordered from</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════
            ENHANCED SPENDING CHART
        ═══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--app-surface)] p-6 rounded-3xl shadow-lg border border-[var(--app-border)] mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--app-text)] mb-1">Spending Overview</h2>
              <p className="text-sm text-[var(--app-text-muted)]">Daily spending pattern</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "var(--app-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--app-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--app-surface)",
                  border: "1px solid var(--app-border)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                formatter={(value) => [formatCurrency(value), "Amount"]}
              />
              <Bar
                dataKey="amount"
                fill="url(#colorAmount)"
                radius={[12, 12, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ═══════════════════════════════════════════════════
            ENHANCED BUDGET CARD
        ═══════════════════════════════════════════════════ */}
        {monthlyBudget > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden bg-[var(--app-surface)] p-6 rounded-3xl shadow-lg border border-[var(--app-border)] mb-8"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--app-text)]">Monthly Budget</h3>
                    <p className="text-sm text-[var(--app-text-muted)]">Track your spending</p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                  budgetRemaining >= 0 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {budgetRemaining >= 0 ? '✓ On Track' : '⚠ Over Budget'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--app-surface-soft)] to-[var(--app-surface)] border border-[var(--app-border)]">
                  <p className="text-sm text-[var(--app-text-muted)] mb-2">Budget</p>
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <label className="flex items-center gap-2 text-xs text-[var(--app-text-muted)] cursor-pointer hover:text-[var(--app-text)] transition-colors">
                        <input 
                          type="checkbox" 
                          checked={saveForAllMonths}
                          onChange={(e) => setSaveForAllMonths(e.target.checked)}
                          className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-[var(--app-surface)]"
                        />
                        <span>Save for all future months</span>
                      </label>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-[var(--app-text)]">{formatCurrency(monthlyBudget)}</p>
                  )}
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--app-surface-soft)] to-[var(--app-surface)] border border-[var(--app-border)]">
                  <p className="text-sm text-[var(--app-text-muted)] mb-2">Spent This Month</p>
                  <p className="text-2xl font-bold text-[var(--app-text)]">{formatCurrency(monthlySpent)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--app-surface-soft)] to-[var(--app-surface)] border border-[var(--app-border)]">
                  <p className={`text-sm mb-2 ${budgetRemaining >= 0 ? 'text-[var(--app-text-muted)]' : 'text-red-500 font-semibold'}`}>
                    {budgetRemaining >= 0 ? 'Remaining' : 'Over Spent'}
                  </p>
                  <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(Math.abs(budgetRemaining))}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative w-full h-4 rounded-full bg-[var(--app-surface-soft)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    budgetRemaining >= 0
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-[var(--app-text-muted)]">{budgetPercent.toFixed(1)}% used</p>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditAmount(String(monthlyBudget));
                        setSaveForAllMonths(budget?.saveForAllMonths || false);
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                    >
                      Edit Budget
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={async () => {
                          const nextAmount = Number(editAmount);
                          if (!nextAmount || nextAmount <= 0) return;
                          try {
                            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                            const response = await fetch(`${API_BASE}/api/budget`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ amount: nextAmount, saveForAllMonths }),
                            });
                            const data = await response.json();
                            if (!response.ok) throw new Error(data.message || "Update failed");
                            setBudget(data.data);
                            setIsEditing(false);
                            setEditAmount("");
                          } catch (err) {
                            console.error("Update error:", err);
                            alert("Error updating budget");
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                            await fetch(`${API_BASE}/api/budget`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            setBudget(null);
                            setIsEditing(false);
                            setEditAmount("");
                          } catch (err) {
                            console.error("Delete error:", err);
                            alert("Error deleting budget");
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditAmount("");
                        }}
                        className="px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════
            PEAK ORDERING TIMES
        ═══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--app-surface)] p-6 rounded-3xl shadow-lg border border-[var(--app-border)] mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--app-text)]">Peak Ordering Times</h3>
              <p className="text-sm text-[var(--app-text-muted)]">Based on current view</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--app-surface-soft)] to-[var(--app-surface)] border border-[var(--app-border)]">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Top meal window</p>
              <p className="text-2xl font-bold text-[var(--app-text)]">{topMealWindow}</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--app-surface-soft)] to-[var(--app-surface)] border border-[var(--app-border)]">
              <p className="text-sm text-[var(--app-text-muted)] mb-2">Weekend or weekday</p>
              <p className="text-2xl font-bold text-[var(--app-text)]">{peakPeriodLabel}</p>
              <p className="text-sm text-[var(--app-text-muted)] mt-2">
                {weekendCount} weekend / {weekdayCount} weekday orders
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ═══════════════════════════════════════════════════
              LEFT SIDEBAR - ADD FORM & FILTERS
          ═══════════════════════════════════════════════════ */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add New Order Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (showAddForm) {
                    setShowAddForm(false);
                    setEditingId(null);
                    return;
                  }
                  openNewOrderForm();
                }}
                className="rainbow-btn flex-1"
              >
                <span className="btn-label">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                   Add New Order
                </span>
                <span className="gradient-container">
                  <span className="gradient"></span>
                </span>
              </motion.button>

              <motion.label
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative group cursor-pointer flex-1 px-6 py-4 rounded-2xl flex items-center justify-center gap-2 border-2 ${isScanning ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-soft)]'} transition-all`}
              >
                {isScanning ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Scanning...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-[var(--app-text)] group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold text-[var(--app-text)] group-hover:text-blue-500 transition-colors">Scan Receipt</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScanReceipt}
                  className="hidden"
                  disabled={isScanning}
                />
              </motion.label>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="magic-card"
                >
                  <div className="magic-card-inner">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                          <span className="text-xl">{editingId ? '✏️' : '➕'}</span>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--app-text)]">
                          {editingId ? 'Edit Order' : 'New Order'}
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingId(null);
                        }}
                        className="w-8 h-8 rounded-full hover:bg-[var(--app-surface-soft)] flex items-center justify-center text-[var(--app-text-muted)] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Food Name */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--app-text-muted)] mb-2">
                        Food Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.foodName}
                        onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                        placeholder="e.g., Paneer Wrap"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      />
                    </div>

                    {/* Restaurant */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--app-text-muted)] mb-2">
                        Restaurant / Source *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.restaurant}
                        onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                        placeholder="e.g., Swiggy - Dominos"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SleekDatePicker
                        label="Date *"
                        value={formData.date}
                        onChange={(val) => setFormData({ ...formData, date: val })}
                      />
                      <SleekTimePicker
                        label="Time *"
                        value={formData.time}
                        onChange={(val) => setFormData({ ...formData, time: val })}
                      />
                    </div>

                    {/* Meal Type */}
                    <SleekSelect
                      label="Meal Type *"
                      value={formData.mealType}
                      onChange={(val) => setFormData({ ...formData, mealType: val })}
                      options={mealTypes.map(type => ({
                        value: type,
                        label: type,
                        icon: mealIcons[type]
                      }))}
                    />

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--app-text-muted)] mb-2">
                        Amount Spent (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="150.00"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      />
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--app-text-muted)] mb-2">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                            className="text-3xl hover:scale-125 transition-transform"
                          >
                            {star <= formData.rating ? "⭐" : "☆"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--app-text-muted)] mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="e.g., Extra spicy, shared with friend"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {editingId ? '💾 Update Order' : '✅ Add Order'}
                    </motion.button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="magic-card"
            >
              <div className="magic-card-inner">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center">
                    <span className="text-xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--app-text)]">Filters & Search</h3>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search food or restaurant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                {/* Meal Type Filter */}
                <div className="mb-4">
                  <SleekSelect
                    label="Meal Type"
                    value={filterMealType}
                    onChange={setFilterMealType}
                    options={[
                      { value: 'all', label: 'All Meals', icon: '🍽️' },
                      ...mealTypes.map(type => ({
                        value: type,
                        label: type,
                        icon: mealIcons[type]
                      }))
                    ]}
                  />
                </div>

                {/* Sort */}
                <div>
                  <SleekSelect
                    label="Sort By"
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      { value: 'date', label: 'Newest First', icon: '📅' },
                      { value: 'amount', label: 'Amount (High to Low)', icon: '💰' }
                    ]}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ═══════════════════════════════════════════════════
              RIGHT COLUMN - RECORDS LIST
          ═══════════════════════════════════════════════════ */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              {/* Header */}
              <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--app-text)]">Order History</h2>
                    <p className="text-sm text-[var(--app-text-muted)]">{filteredRecords.length} {filteredRecords.length === 1 ? 'order' : 'orders'}</p>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => downloadReportPdf('month')}
                    disabled={loading || isGeneratingPdf}
                    className="pdf-btn"
                  >
                    <div className="button-content">
                      <div className="svg-container">
                        <svg className="download-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M19.479 10.092c-.212-3.951-3.473-7.092-7.479-7.092-4.005 0-7.267 3.141-7.479 7.092-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h13c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408zm-7.479 6.908l-4-4h3v-4h2v4h3l-4 4z"></path>
                        </svg>
                      </div>
                      <div className="text-container">
                        <div className="text">{isGeneratingPdf ? 'Wait...' : 'Monthly PDF'}</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadReportPdf('all')}
                    disabled={loading || isGeneratingPdf}
                    className="pdf-btn"
                  >
                    <div className="button-content">
                      <div className="svg-container">
                        <svg className="download-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M19.479 10.092c-.212-3.951-3.473-7.092-7.479-7.092-4.005 0-7.267 3.141-7.479 7.092-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h13c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408zm-7.479 6.908l-4-4h3v-4h2v4h3l-4 4z"></path>
                        </svg>
                      </div>
                      <div className="text-container">
                        <div className="text">{isGeneratingPdf ? 'Wait...' : 'All Orders'}</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Records List */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredRecords.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-[var(--app-surface)] rounded-3xl p-12 text-center border-2 border-dashed border-[var(--app-border)]"
                    >
                      {hasNoOrders ? (
                        <>
                          <div className="text-6xl mb-4">✨</div>
                          <h3 className="text-2xl font-bold text-[var(--app-text)] mb-2">Welcome to your Ledger</h3>
                          <p className="text-[var(--app-text-muted)] mb-6 max-w-md mx-auto">
                            You have not saved any orders yet. Add your first order and BiteTrack will start building your spending timeline.
                          </p>
                          <button
                            type="button"
                            onClick={openNewOrderForm}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                          >
                            Add First Order
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="text-6xl mb-4">🔎</div>
                          <h3 className="text-xl font-bold text-[var(--app-text)] mb-2">No matching orders</h3>
                          <p className="text-[var(--app-text-muted)] mb-6">
                            {hasActiveFilters
                              ? 'Try clearing filters or search to see your saved orders.'
                              : 'No orders found in this view.'}
                          </p>
                          {hasActiveFilters && (
                            <button
                              type="button"
                              onClick={clearFilters}
                              className="px-6 py-3 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] font-semibold hover:bg-[var(--app-surface-soft)] transition-all"
                            >
                              Clear Filters
                            </button>
                          )}
                        </>
                      )}
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
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="magic-card group cursor-pointer mb-4"
                      >
                        <div className="magic-card-inner p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          {/* Left Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center text-3xl">
                                {mealIcons[record.mealType]}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-[var(--app-text)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {record.foodName}
                                </h3>
                                <p className="text-sm text-[var(--app-text-muted)]">{record.restaurant}</p>
                              </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--app-text-muted)] mb-3">
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {record.time}
                              </div>
                              <span className="px-3 py-1 bg-[var(--app-surface-soft)] rounded-full text-xs font-medium border border-[var(--app-border)]">
                                {record.mealType}
                              </span>
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-2">
                              {[1,2,3,4,5].map(star => (
                                <span key={star} className="text-lg">
                                  {star <= Number(record.rating || 0) ? "⭐" : "☆"}
                                </span>
                              ))}
                            </div>

                            {/* Notes */}
                            {record.notes && (
                              <p className="text-sm text-[var(--app-text-muted)] italic px-3 py-2 bg-[var(--app-surface-soft)] rounded-xl border border-[var(--app-border)]">
                                💬 {record.notes}
                              </p>
                            )}
                          </div>

                          {/* Right Content */}
                          <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {formatCurrency(record.amount)}
                            </div>
                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(record)}
                                className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(record.id)}
                                className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </motion.button>
                            </div>
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

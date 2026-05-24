import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SleekDatePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
      return new Date(value);
    }
    return new Date();
  });
  const containerRef = useRef(null);

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handleDateClick = (day) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${dayStr}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = [];
  const totalDays = daysInMonth(viewDate.getMonth(), viewDate.getFullYear());
  const startDay = firstDayOfMonth(viewDate.getMonth(), viewDate.getFullYear());

  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
  }

  for (let i = 1; i <= totalDays; i++) {
    const isSelected = value && (() => {
      const parts = value.split('-');
      return parts.length === 3 && 
             parseInt(parts[0]) === viewDate.getFullYear() && 
             parseInt(parts[1]) === (viewDate.getMonth() + 1) && 
             parseInt(parts[2]) === i;
    })();
    const today = new Date();
    const isToday = today.getFullYear() === viewDate.getFullYear() && 
                    today.getMonth() === viewDate.getMonth() && 
                    today.getDate() === i;

    const dateAtI = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
    const isFuture = dateAtI > today;

    days.push(
      <motion.button
        key={i}
        type="button"
        whileHover={isFuture ? {} : { scale: 1.1 }}
        whileTap={isFuture ? {} : { scale: 0.9 }}
        onClick={() => !isFuture && handleDateClick(i)}
        disabled={isFuture}
        className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm transition-all ${
          isSelected
            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg'
            : isToday
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500/30'
            : isFuture
            ? 'text-[var(--app-text-muted)] opacity-30 cursor-not-allowed'
            : 'text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]'
        }`}
      >
        {i}
      </motion.button>
    );
  }

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setViewDate(new Date(parts[0], parts[1] - 1, parts[2]));
      } else {
        setViewDate(new Date(value));
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[var(--app-text-muted)] mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-left"
      >
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>
            {value ? (
              (() => {
                const parts = value.split('-');
                if (parts.length === 3) {
                  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-IN', { 
                    day: 'numeric', month: 'short', year: 'numeric' 
                  });
                }
                return new Date(value).toLocaleDateString('en-IN', { 
                  day: 'numeric', month: 'short', year: 'numeric' 
                });
              })()
            ) : 'Select Date'}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 mt-2 p-4 bg-[var(--app-surface)] backdrop-blur-2xl border border-[var(--app-border)] rounded-3xl shadow-2xl min-w-[320px]"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-[var(--app-surface-soft)] rounded-xl text-[var(--app-text-muted)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h4 className="font-bold text-[var(--app-text)]">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h4>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-[var(--app-surface-soft)] rounded-xl text-[var(--app-text-muted)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs font-bold text-[var(--app-text-muted)] uppercase py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SleekDatePicker;

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SleekTimePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [hours, minutes] = value ? value.split(':').map(Number) : [12, 0];

  const handleTimeChange = (newHours, newMinutes) => {
    const formattedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    onChange(formattedTime);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

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
          <span>🕒</span>
          <span>{value || 'Select Time'}</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 mt-2 p-4 bg-[var(--app-surface)] backdrop-blur-2xl border border-[var(--app-border)] rounded-3xl shadow-2xl flex gap-4 min-w-[200px]"
          >
            {/* Hours Column */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-[var(--app-text-muted)] uppercase mb-2">Hrs</span>
              <div className="h-48 overflow-y-auto custom-scrollbar px-2 space-y-1">
                {hoursList.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleTimeChange(h, minutes)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                      hours === h
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]'
                    }`}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-[var(--app-text-muted)] uppercase mb-2">Min</span>
              <div className="h-48 overflow-y-auto custom-scrollbar px-2 space-y-1">
                {minutesList.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleTimeChange(hours, m)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                      minutes === m
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]'
                    }`}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SleekTimePicker;

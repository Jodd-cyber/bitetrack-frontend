import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const themes = [
  { id: 'matcha', label: 'Matcha', icon: '🍵' },
  { id: 'spicy', label: 'Spicy', icon: '🌶️' },
  { id: 'midnight-snack', label: 'Midnight', icon: '🌙' },
  { id: 'cafe', label: 'Café', icon: '☕' },
];

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-between w-32 bg-[var(--app-surface-soft)] text-xs text-[var(--app-text)] border border-[var(--app-border)] rounded-md px-3 py-1.5 outline-none cursor-pointer shadow-sm hover:border-[var(--app-accent)] transition-colors"
      >
        <span>{currentTheme.label} {currentTheme.icon}</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-32 bg-[var(--app-surface)] backdrop-blur-xl border border-[var(--app-border)] rounded-md shadow-xl overflow-hidden z-50"
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--app-surface-hover)] transition-colors ${
                  theme === t.id ? 'bg-[var(--app-accent-soft)] font-medium text-[var(--app-accent)]' : 'text-[var(--app-text)]'
                }`}
              >
                <span>{t.label}</span>
                <span>{t.icon}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;

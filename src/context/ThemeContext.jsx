// frontend/src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEMES = ['matcha', 'spicy', 'midnight-snack', 'cafe'];

const readStoredTheme = () => {
  const saved = localStorage.getItem('bitetrack_theme');
  if (saved && THEMES.includes(saved)) {
    return saved;
  }
  // Fallback to legacy dark mode check or default to cafe
  if (localStorage.getItem('darkMode') === 'true') {
    return 'midnight-snack';
  }
  return 'cafe';
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => readStoredTheme());

  useEffect(() => {
    localStorage.setItem('bitetrack_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'midnight-snack');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  };

  const darkMode = theme === 'midnight-snack';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, darkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
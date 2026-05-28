import React, { useEffect, useState } from 'react';

const RealisticFoodBackground = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    updateDarkMode();

    // Observe dark mode changes
    const observer = new MutationObserver(() => updateDarkMode());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 transition-all duration-700"
      style={{
        backgroundImage: 'url(/realistic-food-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
      }}
    >
      {/* Overlay to ensure text readability */}
      <div 
        className="absolute inset-0 transition-colors duration-700"
        style={{
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(4px)' // Add a subtle blur so the UI elements pop more
        }}
      />
    </div>
  );
};

export default RealisticFoodBackground;

import React, { useEffect, useRef, useState } from 'react';

const VantaBackground = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    // Check if the theme is dark
    const isDark = document.documentElement.classList.contains('dark');
    
    // Only initialize if scripts are loaded and it's not dark mode
    if (!vantaEffect && window.VANTA && !isDark) {
      setVantaEffect(
        window.VANTA.CLOUDS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          backgroundColor: 0xffffff,
          skyColor: 0x68b8d7,
          cloudColor: 0xadc1de,
          cloudShadowColor: 0x183550,
          sunColor: 0xff9919,
          sunGlareColor: 0xff6633,
          sunlightColor: 0xff9933,
        })
      );
    }

    // Handle theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const dark = document.documentElement.classList.contains('dark');
          if (dark && vantaEffect) {
            vantaEffect.destroy();
            setVantaEffect(null);
          } else if (!dark && !vantaEffect && window.VANTA) {
            // Re-initialize for light mode
            setVantaEffect(
              window.VANTA.CLOUDS({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.0,
                minWidth: 200.0,
                backgroundColor: 0xffffff,
                skyColor: 0x68b8d7,
                cloudColor: 0xadc1de,
                cloudShadowColor: 0x183550,
                sunColor: 0xff9919,
                sunGlareColor: 0xff6633,
                sunlightColor: 0xff9933,
              })
            );
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      if (vantaEffect) vantaEffect.destroy();
      observer.disconnect();
    };
  }, [vantaEffect]);

  return (
    <div 
      ref={vantaRef} 
      id="vanta-bg"
      className="fixed inset-0 -z-10 transition-opacity duration-1000 html-dark-hidden"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default VantaBackground;

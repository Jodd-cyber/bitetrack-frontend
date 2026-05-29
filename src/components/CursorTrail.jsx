import React, { useEffect, useState } from 'react';

const CursorTrail = () => {
  const [crumbs, setCrumbs] = useState([]);

  useEffect(() => {
    // Apply custom fork cursor
    const cursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 2v20"/><path d="M7 2v20"/><path d="M7 2a5 5 0 0 1 10 0"/></svg>`;
    const cursorUrl = `url("data:image/svg+xml;utf8,${cursorSvg}") 12 12, auto`;
    document.body.style.cursor = cursorUrl;

    let lastTime = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      // Drop a crumb every 150ms
      if (now - lastTime > 150) {
        const id = now;
        setCrumbs(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
        lastTime = now;
        
        // Remove crumb after 1s
        setTimeout(() => {
          setCrumbs(prev => prev.filter(c => c.id !== id));
        }, 1000);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {crumbs.map(crumb => (
        <div
          key={crumb.id}
          className="absolute"
          style={{
            left: crumb.x,
            top: crumb.y,
            transform: 'translate(-50%, -50%)',
            fontSize: '12px',
            animation: 'crumbFadeOut 1s forwards'
          }}
        >
          🍪
        </div>
      ))}
    </div>
  );
};

export default CursorTrail;

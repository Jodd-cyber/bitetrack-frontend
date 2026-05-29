import React, { useEffect } from 'react';

const CursorTrail = () => {
  useEffect(() => {
    // Apply custom fork cursor
    const cursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 2v20"/><path d="M7 2v20"/><path d="M7 2a5 5 0 0 1 10 0"/></svg>`;
    const cursorUrl = `url("data:image/svg+xml;utf8,${cursorSvg}") 12 12, auto`;
    document.body.style.cursor = cursorUrl;

    // Remove custom cursor on unmount
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  return null;
};

export default CursorTrail;

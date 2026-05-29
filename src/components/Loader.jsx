import React from 'react';
import './Loader.css';

const Loader = ({ text = "Fetching delicious data..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--app-bg)] backdrop-blur-sm">
      {/* Overlay to ensure readability in both modes */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/40"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="pizza-loader">
          <div className="slice"></div>
          <div className="slice"></div>
          <div className="slice"></div>
          <div className="slice"></div>
          <div className="slice"></div>
          <div className="slice"></div>
          <div className="slice"></div>
          <div className="slice"></div>
        </div>
        
        <div className="text-xl font-bold tracking-wider text-[var(--app-text)] animate-pulse drop-shadow-md">
          {text}
        </div>
      </div>
    </div>
  );
};

export default Loader;

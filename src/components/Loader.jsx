import React from 'react';
import './Loader.css';

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--app-bg)] backdrop-blur-md">
      <div className="pl">
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__text">{text}</div>
      </div>
    </div>
  );
};

export default Loader;

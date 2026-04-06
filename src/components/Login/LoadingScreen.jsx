import React, { useEffect, useState } from 'react';
import './Login.css';
import logo from '../../assets/logo.png';

export default function LoadingScreen({ onLoadingComplete, loadingTexts: propsLoadingTexts }) {
  const [textIndex, setTextIndex] = useState(0);
  
  const loadingTexts = propsLoadingTexts || [
    "Establishing secure connection to API...",
    "Retrieving CEO dashboard credentials...",
    "Syncing enterprise cross-function data...",
    "Compiling critical alerts & warnings...",
    "Initializing Intelligence Engine..."
  ];


  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1 < loadingTexts.length ? prev + 1 : prev));
    }, 600);
    
    // Auto complete loading after a set duration
    const completeTimeout = setTimeout(() => {
      onLoadingComplete();
    }, 3200);

    return () => {
      clearInterval(textInterval);
      clearTimeout(completeTimeout);
    };
  }, [onLoadingComplete, loadingTexts.length]);

  return (
    <div id="loading-screen">
      <div className="login-bg-grid"></div>
      <div className="login-bg-orb o1"></div>
      <div className="login-bg-orb o2"></div>
      
      <div className="loading-content">
        <div className="loading-logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img src={logo} alt="MEXI Logo" style={{ height: '90px', width: 'auto' }} />
        </div>
        
        <div className="loading-spinner-wrapper">
          <svg className="ls-spinner" viewBox="0 0 50 50">
            <circle className="ls-path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
          </svg>
        </div>
        
        <div className="loading-text-container">
          <span className="loading-text-active">{loadingTexts[textIndex]}</span>
        </div>
      </div>
    </div>
  );
}

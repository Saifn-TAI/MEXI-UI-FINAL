import React, { useState } from 'react';
import './Login.css';

export default function LoginPage({ onLoginSuccess, onGoToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidGmail = (val) => {
    return /^[a-zA-Z0-9._%+\-]+@gmail\.com$/i.test(val.trim());
  };

  const doLogin = () => {
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter your Gmail address.');
      return;
    }
    if (!isValidGmail(email)) {
      setErrorMsg('Please enter a valid Gmail address (e.g. you@gmail.com).');
      return;
    }
    if (!password || password.length < 1) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email);
    }, 1200 + Math.random() * 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      doLogin();
    }
  };

  return (
    <div id="login-screen" onKeyDown={handleKeyDown}>
      <div className="login-bg-grid"></div>
      <div className="login-bg-orb o1"></div>
      <div className="login-bg-orb o2"></div>
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-text">MEXI<span className="login-logo-pip"></span></div>
          <div className="login-logo-div"></div>
          <span className="login-logo-sub">Veejei Automation</span>
        </div>
        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to access the CEO Intelligence Dashboard</div>

        <div className={`login-error ${errorMsg ? 'show' : ''}`} id="login-error">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="7" cy="7" r="5.5" />
            <path d="M7 4.5v3M7 9v.5" strokeLinecap="round" />
          </svg>
          <span id="login-error-msg">{errorMsg}</span>
        </div>

        <div className="login-field">
          <label className="login-label" htmlFor="login-email">Email Address</label>
          <div className="login-input-wrap">
            <svg className="login-input-icon" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.4">
              <rect x="2" y="4" width="14" height="10" rx="2" />
              <path d="M2 6l7 5 7-5" />
            </svg>
            <input 
              className="login-input" 
              id="login-email" 
              type="email" 
              placeholder="you@gmail.com" 
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="login-field">
          <label className="login-label" htmlFor="login-pw">Password</label>
          <div className="login-input-wrap">
            <svg className="login-input-icon" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.4">
              <rect x="4" y="8" width="10" height="7" rx="2" />
              <path d="M6 8V6a3 3 0 016 0v2" />
            </svg>
            <input 
              className="login-input" 
              id="login-pw" 
              type={showPw ? 'text' : 'password'} 
              placeholder="Enter your password" 
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="login-toggle-pw" id="toggle-pw" onClick={() => setShowPw(!showPw)} type="button">
              <svg id="eye-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                {showPw ? (
                  <>
                    <path d="M2 8s3-5.5 6-5.5 6 5.5 6 5.5-3 5.5-6 5.5S2 8 2 8z" />
                    <line x1="2" y1="2" x2="14" y2="14" />
                  </>
                ) : (
                  <>
                    <ellipse cx="8" cy="8" rx="6" ry="4" />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className="login-row">
          <label className="login-remember"><input type="checkbox" id="remember" /> Remember me</label>
          <button className="login-forgot" onClick={() => {}}>Forgot password?</button>
        </div>

        <button className={`login-btn ${isLoading ? 'loading' : ''}`} id="login-btn" onClick={doLogin}>
          <div className="login-spinner" id="login-spinner"></div>
          <span className="login-btn-txt" id="login-btn-txt">Sign In to MEXI</span>
          {!isLoading && (
            <svg id="login-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.6">
              <path d="M2 7h10M8 3l4 4-4 4" />
            </svg>
          )}
        </button>

        <div className="login-foot-links" style={{ textAlign: 'center', marginTop: '24px', fontFamily: 'var(--f-body)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
          Don't have an account? <button onClick={onGoToSignup} style={{ background: 'none', border: 'none', color: 'var(--primary-mid)', fontWeight: '600', cursor: 'pointer' }}>Sign up</button>
        </div>
      </div>
    </div>
  );
}

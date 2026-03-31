import React, { useState } from 'react';
import './Login.css';
import logo from '../../assets/logo.png';

export default function SignupPage({ onSignupSuccess, onGoToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    retypePassword: ''
  });
  
  const [showPw, setShowPw] = useState(false);
  const [showRetypePw, setShowRetypePw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const doSignup = () => {
    setErrorMsg('');

    if (!formData.username || !formData.fullName || !formData.email || !formData.phone || !formData.company || !formData.password || !formData.retypePassword) {
      setErrorMsg('Please fill out all fields.');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (formData.password !== formData.retypePassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSignupSuccess(formData.email);
    }, 1500 + Math.random() * 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      doSignup();
    }
  };

  return (
    <div id="login-screen" onKeyDown={handleKeyDown}>
      <div className="login-bg-grid"></div>
      <div className="login-bg-orb o1"></div>
      <div className="login-bg-orb o2"></div>
      
      {/* Slightly wider card and less padding to accommodate more fields cleanly */}
      <div className="login-card" style={{ width: '480px', padding: '40px' }}>
        <div className="login-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          <img src={logo} alt="MEXI Logo" style={{ height: '70px', width: 'auto', display: 'block' }} />
        </div>
        
        <div className="login-title">Create an account</div>

        <div className={`login-error ${errorMsg ? 'show' : ''}`} id="login-error">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="7" cy="7" r="5.5" />
            <path d="M7 4.5v3M7 9v.5" strokeLinecap="round" />
          </svg>
          <span id="login-error-msg">{errorMsg}</span>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div className="login-field" style={{ flex: 1, marginBottom: 0 }}>
            <label className="login-label">Username (Name)</label>
            <div className="login-input-wrap">
              <input className="login-input" style={{ paddingLeft: '16px' }} type="text" name="username" placeholder="john_doe" value={formData.username} onChange={handleChange} />
            </div>
          </div>
          <div className="login-field" style={{ flex: 1, marginBottom: 0 }}>
            <label className="login-label">Full Name</label>
            <div className="login-input-wrap">
              <input className="login-input" style={{ paddingLeft: '16px' }} type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div className="login-field" style={{ flex: 1, marginBottom: 0 }}>
            <label className="login-label">Email Address</label>
            <div className="login-input-wrap">
              <input className="login-input" style={{ paddingLeft: '16px' }} type="email" name="email" placeholder="you@domain.com" value={formData.email} onChange={handleChange} />
            </div>
          </div>
          <div className="login-field" style={{ flex: 1, marginBottom: 0 }}>
            <label className="login-label">Phone Number</label>
            <div className="login-input-wrap">
              <input className="login-input" style={{ paddingLeft: '16px' }} type="tel" name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="login-field" style={{ marginBottom: '16px' }}>
          <label className="login-label">Company Name</label>
          <div className="login-input-wrap">
            <input className="login-input" style={{ paddingLeft: '16px' }} type="text" name="company" placeholder="Acme Corp" value={formData.company} onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="login-field" style={{ flex: 1, marginBottom: 0 }}>
            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <input className="login-input" style={{ paddingLeft: '16px' }} type={showPw ? 'text' : 'password'} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
              <button className="login-toggle-pw" onClick={() => setShowPw(!showPw)} type="button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {showPw ? (
                    <><path d="M2 8s3-5.5 6-5.5 6 5.5 6 5.5-3 5.5-6 5.5S2 8 2 8z" /><line x1="2" y1="2" x2="14" y2="14" /></>
                  ) : (
                    <><ellipse cx="8" cy="8" rx="6" ry="4" /><circle cx="8" cy="8" r="1.5" fill="currentColor" /></>
                  )}
                </svg>
              </button>
            </div>
          </div>
          <div className="login-field" style={{ flex: 1, marginBottom: 0 }}>
            <label className="login-label">Retype Password</label>
            <div className="login-input-wrap">
              <input className="login-input" style={{ paddingLeft: '16px' }} type={showRetypePw ? 'text' : 'password'} name="retypePassword" placeholder="••••••••" value={formData.retypePassword} onChange={handleChange} />
              <button className="login-toggle-pw" onClick={() => setShowRetypePw(!showRetypePw)} type="button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {showRetypePw ? (
                    <><path d="M2 8s3-5.5 6-5.5 6 5.5 6 5.5-3 5.5-6 5.5S2 8 2 8z" /><line x1="2" y1="2" x2="14" y2="14" /></>
                  ) : (
                    <><ellipse cx="8" cy="8" rx="6" ry="4" /><circle cx="8" cy="8" r="1.5" fill="currentColor" /></>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button className={`login-btn ${isLoading ? 'loading' : ''}`} onClick={doSignup}>
          <div className="login-spinner"></div>
          <span className="login-btn-txt">Sign Up to MEXI</span>
          {!isLoading && (
            <svg id="login-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.6">
              <path d="M2 7h10M8 3l4 4-4 4" />
            </svg>
          )}
        </button>

        <div className="login-foot-links" style={{ textAlign: 'center', marginTop: '24px', fontFamily: 'var(--f-body)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
          Already have an account? <button onClick={onGoToLogin} style={{ background: 'none', border: 'none', color: 'var(--primary-mid)', fontWeight: '600', cursor: 'pointer' }}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

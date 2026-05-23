import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';

const WelcomeAnimation = () => {
  const { isAuthenticated } = useAuthStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="welcome-animation-overlay">
      <div className="welcome-animation-content">
        <svg viewBox="0 0 120 100" className="tabla-svg" aria-hidden="true">
          <defs>
            <radialGradient id="leftGrad" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>
            <radialGradient id="rightGrad" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7e22ce" />
            </radialGradient>
          </defs>
          {/* Left tabla drum body */}
          <ellipse cx="38" cy="68" rx="22" ry="8" fill="rgba(8,145,178,0.3)" />
          <rect x="18" y="40" width="40" height="28" rx="4" fill="url(#leftGrad)" className="tabla-left" />
          {/* Left drumhead */}
          <ellipse cx="38" cy="40" rx="20" ry="7" fill="#0e7490" />
          <ellipse cx="38" cy="40" rx="14" ry="5" fill="#164e63" />
          <ellipse cx="38" cy="40" rx="7" ry="2.5" fill="#083344" className="tabla-syahi-left" />
          {/* Right tabla drum body (bayan - bigger) */}
          <ellipse cx="85" cy="72" rx="27" ry="9" fill="rgba(126,34,206,0.3)" />
          <rect x="60" y="42" width="50" height="30" rx="5" fill="url(#rightGrad)" className="tabla-right" />
          {/* Right drumhead */}
          <ellipse cx="85" cy="42" rx="25" ry="8" fill="#6b21a8" />
          <ellipse cx="85" cy="42" rx="17" ry="5.5" fill="#581c87" />
          <ellipse cx="85" cy="42" rx="8" ry="2.8" fill="#3b0764" className="tabla-syahi-right" />
          {/* Rope wrapping on left */}
          <line x1="22" y1="48" x2="22" y2="64" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6"/>
          <line x1="28" y1="47" x2="28" y2="65" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6"/>
          <line x1="48" y1="47" x2="48" y2="65" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6"/>
          <line x1="54" y1="48" x2="54" y2="64" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6"/>
          {/* Rope wrapping on right */}
          <line x1="65" y1="50" x2="65" y2="67" stroke="#c084fc" strokeWidth="1.5" opacity="0.6"/>
          <line x1="73" y1="48" x2="73" y2="68" stroke="#c084fc" strokeWidth="1.5" opacity="0.6"/>
          <line x1="97" y1="48" x2="97" y2="68" stroke="#c084fc" strokeWidth="1.5" opacity="0.6"/>
          <line x1="105" y1="50" x2="105" y2="67" stroke="#c084fc" strokeWidth="1.5" opacity="0.6"/>
        </svg>
        <h1 className="welcome-title">RAGAS</h1>
        <p className="welcome-subtitle">Enter the rhythm</p>
      </div>
    </div>
  );
};

export default WelcomeAnimation;

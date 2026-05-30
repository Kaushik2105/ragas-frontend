import { useEffect, useState } from 'react';
import AppLogo from '../common/AppLogo';

const WelcomeAnimation = () => {
  const [show, setShow] = useState(() => !sessionStorage.getItem('hasSeenWelcome'));

  useEffect(() => {
    if (show) {
      sessionStorage.setItem('hasSeenWelcome', 'true');
      const timer = setTimeout(() => setShow(false), 2600);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="welcome-animation-overlay">
      <div className="welcome-animation-content">
        <div className="hologram-visualizer">
          <div className="soundwave-ring ring-1"></div>
          <div className="soundwave-ring ring-2"></div>
          <div className="soundwave-ring ring-3"></div>

          <div className="welcome-logo-card">
            <AppLogo size="xl" showText={false} />
          </div>

          <div className="welcome-equalizer" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
          <span className="orbit-note note-1">♪</span>
          <span className="orbit-note note-2">♫</span>
          <span className="orbit-note note-3">♬</span>
          <div className="floating-particle p-1"></div>
          <div className="floating-particle p-2"></div>
          <div className="floating-particle p-3"></div>
        </div>
        
        <h1 className="welcome-title">RAGAS</h1>
        <p className="welcome-subtitle">Enter the rhythm</p>
      </div>
    </div>
  );
};

export default WelcomeAnimation;

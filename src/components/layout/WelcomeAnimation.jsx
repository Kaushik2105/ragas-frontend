import { useEffect, useState } from 'react';

const WelcomeAnimation = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show only once per browser session for premium UX
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShow(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
      const timer = setTimeout(() => setShow(false), 2600);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="welcome-animation-overlay">
      <div className="welcome-animation-content">
        <div className="hologram-visualizer">
          {/* Neon pulsating rings representing audio waves */}
          <div className="soundwave-ring ring-1"></div>
          <div className="soundwave-ring ring-2"></div>
          <div className="soundwave-ring ring-3"></div>

          {/* Premium holographic vinyl record */}
          <div className="vinyl-record">
            <div className="vinyl-groove groove-1"></div>
            <div className="vinyl-groove groove-2"></div>
            <div className="vinyl-label">
              <div className="vinyl-core"></div>
            </div>
          </div>

          {/* Glowing particle micro-orbs */}
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

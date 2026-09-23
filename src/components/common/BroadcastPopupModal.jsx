import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Sparkles, MessageSquare, X, ArrowRight, Bell } from 'lucide-react';
import api from '../../api/axios';
import config from '../../config';
import { unwrap } from '../../utils/music';

const DISMISSED_STORAGE_KEY = 'ragas_dismissed_popups';

const getDismissedIds = () => {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const markPopupDismissed = (id) => {
  try {
    const ids = getDismissedIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(ids));
    }
  } catch {
    // Ignore storage errors
  }
};

const BroadcastPopupModal = () => {
  const [popup, setPopup] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // 1. Fetch active popup on mount
  useEffect(() => {
    let isMounted = true;

    const checkActivePopup = async () => {
      try {
        const response = await api.get('/popups/active');
        const data = unwrap(response);
        const popups = data?.popups || (data?.latest ? [data.latest] : []);

        const dismissed = getDismissedIds();
        // Pick the newest active popup that hasn't been dismissed by this user
        const unreadPopup = popups.find((p) => p && !dismissed.includes(p.id));

        if (unreadPopup && isMounted) {
          setPopup(unreadPopup);
          setIsOpen(true);
        }
      } catch (err) {
        // Silently catch network errors during popup check
      }
    };

    checkActivePopup();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-time Socket.IO listener for live broadcasts
  useEffect(() => {
    let socket = null;

    try {
      const apiBase = config.apiBaseUrl || '';
      // Strip trailing /api to connect to root socket namespace
      const socketUrl = apiBase.replace(/\/api\/?$/, '');

      socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      socket.on('popup:new', (newPopup) => {
        if (!newPopup || !newPopup.id) return;
        const dismissed = getDismissedIds();
        if (!dismissed.includes(newPopup.id)) {
          setPopup(newPopup);
          setIsOpen(true);
        }
      });
    } catch (err) {
      console.warn('Socket connection error in BroadcastPopupModal:', err);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  if (!isOpen || !popup) return null;

  const handleDismiss = () => {
    if (popup?.id) {
      markPopupDismissed(popup.id);
    }
    setIsOpen(false);
  };

  const handleAction = () => {
    if (popup?.id) {
      markPopupDismissed(popup.id);
    }
    setIsOpen(false);

    if (popup.actionUrl) {
      if (popup.actionUrl.startsWith('http://') || popup.actionUrl.startsWith('https://')) {
        window.open(popup.actionUrl, '_blank', 'noopener,noreferrer');
      } else {
        navigate(popup.actionUrl);
      }
    }
  };

  const isFeedback = popup.type === 'feedback';

  return (
    <div className="broadcast-modal-backdrop" onClick={handleDismiss}>
      <div
        className="broadcast-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Gradient Glow */}
        <div className={`broadcast-modal-glow ${isFeedback ? 'glow-pink' : 'glow-cyan'}`} />

        {/* Close Button */}
        <button
          type="button"
          className="broadcast-modal-close-btn"
          onClick={handleDismiss}
          aria-label="Close notification"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Tag */}
        <div className="broadcast-modal-header">
          <div className={`broadcast-modal-icon-badge ${isFeedback ? 'icon-feedback' : 'icon-message'}`}>
            {isFeedback ? <MessageSquare size={26} /> : <Sparkles size={26} />}
          </div>
          <span className="broadcast-modal-category">
            {isFeedback ? 'Feedback Alert' : 'Announcement'}
          </span>
        </div>

        {/* Title & Body */}
        <h2 className="broadcast-modal-title">{popup.title}</h2>
        <p className="broadcast-modal-message">{popup.message}</p>

        {/* Action Controls */}
        <div className="broadcast-modal-actions">
          {popup.actionText ? (
            <button
              type="button"
              className="broadcast-modal-primary-btn"
              onClick={handleAction}
            >
              <span>{popup.actionText}</span>
              <ArrowRight size={16} />
            </button>
          ) : null}

          <button
            type="button"
            className="broadcast-modal-secondary-btn"
            onClick={handleDismiss}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastPopupModal;

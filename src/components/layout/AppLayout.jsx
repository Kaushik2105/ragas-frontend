import { Menu, LogIn, UserPlus } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PlayerBar from '../player/PlayerBar';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { initials, assetUrl } from '../../utils/music';

const AppLayout = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { toggleSidebar, openAuthModal } = useUIStore();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-shell">
        <header className="topbar">
          <div className="topbar-left-group">
            <button className="ghost-button mobile-only" type="button" onClick={toggleSidebar} aria-label="Open menu">
              <Menu size={20} />
            </button>
            
            {isAuthenticated ? (
              <div className="topbar-user-info">
                <span className="eyebrow">Welcome back</span>
                <strong>{user?.name || 'Listener'}</strong>
              </div>
            ) : (
              <div className="topbar-user-info guest-info">
                <span className="eyebrow">Welcome to RAGAS</span>
                <span className="guest-mode-tag">Guest Mode</span>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="avatar">
              {user?.profilePic
                ? <img src={assetUrl(user.profilePic)} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : initials(user?.name)}
            </div>
          ) : (
            <div className="topbar-auth-buttons">
              <button
                type="button"
                className="ghost-button compact-btn"
                onClick={() => openAuthModal('login')}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                type="button"
                className="primary-button compact-btn"
                onClick={() => openAuthModal('register')}
              >
                <UserPlus size={15} /> Sign Up
              </button>
            </div>
          )}
        </header>
        <Outlet />
        <footer className="app-footer">
          &copy; {new Date().getFullYear()} RAGAS. Made with ❤️ by Kaushik.
        </footer>
      </main>
      <PlayerBar />
    </div>
  );
};

export default AppLayout;

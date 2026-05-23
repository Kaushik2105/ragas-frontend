import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PlayerBar from '../player/PlayerBar';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { initials, assetUrl } from '../../utils/music';

const AppLayout = () => {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-shell">
        <header className="topbar">
          <button className="ghost-button mobile-only" type="button" onClick={toggleSidebar} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div>
            <span className="eyebrow">Welcome back</span>
            <strong>{user?.name || 'Listener'}</strong>
          </div>
          <div className="avatar">
            {user?.profilePic
              ? <img src={assetUrl(user.profilePic)} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials(user?.name)}
          </div>
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

import { Home, ListMusic, LogOut, Music, Search, Star, User, LayoutDashboard, Mic2, Users, MessageSquare, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import AppLogo from '../common/AppLogo';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const isAdmin = user?.role === 'admin';

  return (
    <nav className={`sidebar${sidebarOpen ? ' open' : ''}`}>
      <div className="brand-row">
        <NavLink className="brand" to="/">
          <AppLogo />
        </NavLink>
        <button className="ghost-button mobile-only" type="button" onClick={toggleSidebar} aria-label="Toggle menu">
          <X size={20} />
        </button>
      </div>

      {isAdmin ? (
        <div className="nav-group">
          <span className="nav-label">Admin</span>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/admin" end onClick={() => sidebarOpen && toggleSidebar()}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/admin/songs" onClick={() => sidebarOpen && toggleSidebar()}>
            <Mic2 size={18} /> Songs
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/admin/users" onClick={() => sidebarOpen && toggleSidebar()}>
            <Users size={18} /> Users
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/admin/feedback" onClick={() => sidebarOpen && toggleSidebar()}>
            <MessageSquare size={18} /> Feedback
          </NavLink>
        </div>
      ) : (
        <div className="nav-group">
          <span className="nav-label">Menu</span>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/" end onClick={() => sidebarOpen && toggleSidebar()}>
            <Home size={18} /> Home
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/search" onClick={() => sidebarOpen && toggleSidebar()}>
            <Search size={18} /> Search
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/favorites" onClick={() => sidebarOpen && toggleSidebar()}>
            <Star size={18} /> Favorites
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/playlists" onClick={() => sidebarOpen && toggleSidebar()}>
            <ListMusic size={18} /> Playlists
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/feedback" onClick={() => sidebarOpen && toggleSidebar()}>
            <MessageSquare size={18} /> Feedback
          </NavLink>
        </div>
      )}

      <div className="sidebar-footer">
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/profile" onClick={() => sidebarOpen && toggleSidebar()}>
          <User size={18} /> Profile
        </NavLink>
        <div className="role-badge">
          <Music size={14} />
          <span>{isAdmin ? 'Administrator' : 'Listener'}</span>
        </div>
        <button className="logout-button" type="button" onClick={logout}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;

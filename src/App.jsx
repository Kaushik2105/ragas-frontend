import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loader from './components/common/Loader';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import NotFound from './pages/NotFound';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Home = lazy(() => import('./pages/user/Home'));
const Search = lazy(() => import('./pages/user/Search'));
const Favorites = lazy(() => import('./pages/user/Favorites'));
const Playlists = lazy(() => import('./pages/user/Playlists'));
const Profile = lazy(() => import('./pages/user/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminSongs = lazy(() => import('./pages/admin/AdminSongs'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminFeedback = lazy(() => import('./pages/admin/AdminFeedback'));

import { Toaster } from 'react-hot-toast';

const App = () => (
  <>
    <Toaster position="top-right" toastOptions={{ style: { background: '#111827', color: '#f8fafc', border: '1px solid #312e81' } }} />
    <Suspense fallback={<Loader label="Loading RAGAS" />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/songs" element={<AdminSongs />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </>
);

export default App;

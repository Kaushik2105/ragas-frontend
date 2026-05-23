import { Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark"><Music size={22} /></span>
          <span>RAGAS</span>
        </div>
        <h1>Log in and press play.</h1>
        <p>Your dark-purple listening room is waiting.</p>
        <form className="form-stack" onSubmit={handleSubmit(async (data) => {
          const result = await login(data);
          if (result?.success) {
            toast.success('Welcome back to RAGAS');
            navigate(from, { replace: true });
          } else {
            toast.error(result?.message || 'Login failed');
          }
        })}>
          <label>
            Email
            <input type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <small>{errors.email.message}</small>}
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <small>{errors.password.message}</small>}
          </label>
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch" style={{ marginTop: '-8px' }}>
          <Link to="/forgot-password" style={{ color: 'var(--muted)', fontWeight: 'normal', fontSize: '0.85rem' }}>Forgot your password?</Link>
        </p>
        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
};

export default Login;

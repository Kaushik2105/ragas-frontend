import { useNavigate } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AppLogo from '../../components/common/AppLogo';
import useAuthStore from '../../store/authStore';
import { GoogleLogin } from '@react-oauth/google';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, isLoading, isAuthenticated } = useAuthStore();
  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand">
          <AppLogo />
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
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
            <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></span>
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
            <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '320px' }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const result = await googleLogin(credentialResponse.credential);
                if (result?.success) {
                  toast.success('Welcome to RAGAS');
                  navigate(from, { replace: true });
                } else {
                  toast.error(result?.message || 'Google Login failed');
                }
              }}
              onError={() => {
                toast.error('Google Sign-In failed');
              }}
              theme="filled_blue"
              shape="pill"
              text="continue_with"
              width="320"
            />
          </div>
        </div>

        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
        <div style={{ marginTop: '14px', paddingTop: '18px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '12px' }}>Want a native experience?</p>
          <a href="https://github.com/Kaushik2105/Ragas-Mobile/releases/download/v1.0.7/ragas-v1.0.7.apk" target="_blank" rel="noopener noreferrer" className="ghost-button" style={{ width: '100%', textDecoration: 'none' }}>
            <Smartphone size={18} /> Download the Mobile App
          </a>
        </div>
      </section>
    </main>
  );
};

export default Login;

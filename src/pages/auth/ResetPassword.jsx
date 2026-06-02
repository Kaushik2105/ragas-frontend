import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import AppLogo from '../../components/common/AppLogo';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const source = searchParams.get('source');
  const navigate = useNavigate();

  useEffect(() => {
    if (source === 'app' && token) {
      // Attempt to auto-redirect to RAGAS mobile application
      window.location.href = `ragas://reset-password?token=${token}`;
    }
  }, [source, token]);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset token is missing');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { token, password: data.password });
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand">
          <AppLogo />
        </div>
        <h1>Choose a new password</h1>
        <p>Make sure it's strong and unique.</p>
        
        {source === 'app' && token && (
          <div className="app-redirect-panel" style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#22d3ee', margin: '0 0 8px 0', fontSize: '16px' }}>Resetting via Mobile App</h3>
            <p style={{ fontSize: '13px', margin: '0 0 14px 0', color: 'var(--muted)', lineHeight: '18px' }}>
              We're opening the RAGAS app to complete your password reset natively.
            </p>
            <a 
              href={`ragas://reset-password?token=${token}`}
              className="primary-button"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                color: '#fff'
              }}
            >
              Open in RAGAS App
            </a>
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '10px', marginBottom: 0, lineHeight: '16px' }}>
              If the app didn't open automatically, tap the button above. Alternatively, you can reset using the web form below.
            </p>
          </div>
        )}

        <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
          <label>
            New Password
            <input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <small>{errors.password.message}</small>}
          </label>
          <button className="primary-button" type="submit" disabled={loading || !token}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {!token && (
          <p className="auth-switch" style={{ color: 'var(--danger)' }}>
            Missing reset token. <Link to="/forgot-password">Request a new one</Link>.
          </p>
        )}
      </section>
    </main>
  );
};

export default ResetPassword;

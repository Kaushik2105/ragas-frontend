import { Music } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', data);
      if (response.data.success) {
        toast.success(response.data.message);
        if (response.data.data?.token) {
          setResetToken(response.data.data.token);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark"><Music size={22} /></span>
          <span>RAGAS</span>
        </div>
        <h1>Reset your password</h1>
        <p>Enter your email to get a reset link.</p>
        <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email
            <input type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <small>{errors.email.message}</small>}
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {resetToken && (
          <div className="panel" style={{ marginTop: 20, textAlign: 'center' }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>[DEV MODE] Reset Token Generated</p>
            <p style={{ fontSize: '0.8rem', wordBreak: 'break-all', marginBottom: 14, color: 'var(--cyan)' }}>{resetToken}</p>
            <Link to={`/reset-password?token=${resetToken}`} className="primary-button" style={{ display: 'inline-block' }}>
              Click here to reset
            </Link>
          </div>
        )}

        <p className="auth-switch">Remembered it? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
};

export default ForgotPassword;

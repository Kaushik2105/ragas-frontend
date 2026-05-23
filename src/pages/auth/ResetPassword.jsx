import { Music } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

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
          <span className="brand-mark"><Music size={22} /></span>
          <span>RAGAS</span>
        </div>
        <h1>Choose a new password</h1>
        <p>Make sure it's strong and unique.</p>
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

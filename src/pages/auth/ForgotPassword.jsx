import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import AppLogo from '../../components/common/AppLogo';
import { sendResetEmail } from '../../utils/email';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', data);
      if (response.data.success) {
        const resetData = response.data.data;
        if (resetData?.token) {
          const resetLink = `${window.location.origin}/reset-password?token=${resetData.token}`;
          await sendResetEmail({ email: resetData.email || data.email, name: resetData.name, resetLink });
        }
        toast.success('If that email exists, a reset link has been sent.');
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
          <AppLogo />
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
        <p className="auth-switch">Remembered it? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
};

export default ForgotPassword;

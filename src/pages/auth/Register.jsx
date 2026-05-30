import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, Navigate } from 'react-router-dom';
import AppLogo from '../../components/common/AppLogo';
import useAuthStore from '../../store/authStore';
import { sendWelcomeEmail } from '../../utils/email';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, isAuthenticated } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <main className="auth-screen">
      <section className="auth-card wide">
        <div className="auth-brand">
          <AppLogo />
        </div>
        <h1>Start your collection.</h1>
        <p>Create a listener account and build playlists, favorites, and feedback.</p>
        <form className="form-stack" onSubmit={handleSubmit(async (data) => {
          const result = await registerUser(data);
          if (result?.success) {
            toast.success('Account created. Welcome to RAGAS!');
            sendWelcomeEmail(result.user || data).catch(() => {});
            navigate('/', { replace: true });
          } else {
            toast.error(result?.message || 'Registration failed');
          }
        })}>
          <label>
            Name
            <input type="text" placeholder="Your name" {...register('name')} />
            {errors.name && <small>{errors.name.message}</small>}
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <small>{errors.email.message}</small>}
          </label>
          <label>
            Password
            <input type="password" placeholder="At least 6 characters" {...register('password')} />
            {errors.password && <small>{errors.password.message}</small>}
          </label>
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">Already listening? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
};

export default Register;

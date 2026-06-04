import { useState } from 'react';
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
  password: z.string().optional(),
});

const Register = () => {
  const navigate = useNavigate();
  const {
    requestRegistrationOtp,
    verifyRegistrationOtp,
    register: registerUser,
    isLoading,
    isAuthenticated,
  } = useAuthStore();
  const [step, setStep] = useState('details');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const requestOtp = async (data) => {
    const result = await requestRegistrationOtp({ name: data.name, email: data.email });
    if (result?.success) {
      toast.success('OTP sent to your email.');
      setStep('otp');
    } else {
      toast.error(result?.message || 'Could not send OTP');
    }
  };

  const verifyOtp = async () => {
    const email = getValues('email');
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error('Enter the 6-digit OTP.');
      return;
    }

    const result = await verifyRegistrationOtp({ email, otp: otp.trim() });
    if (result?.success) {
      setVerificationToken(result.verificationToken);
      setStep('password');
      toast.success('Email verified.');
    } else {
      toast.error(result?.message || 'OTP verification failed');
    }
  };

  const createAccount = async () => {
    const { email, password } = getValues();
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    const result = await registerUser({ email, password, verificationToken });
    if (result?.success) {
      toast.success('Account created. Welcome to RAGAS!');
      sendWelcomeEmail(result.user || getValues()).catch(() => {});
      navigate('/', { replace: true });
    } else {
      toast.error(result?.message || 'Registration failed');
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-card wide">
        <div className="auth-brand">
          <AppLogo />
        </div>
        <h1>Start your collection.</h1>
        <p>Create a listener account and build playlists, favorites, and feedback.</p>
        <form className="form-stack" onSubmit={handleSubmit(requestOtp)}>
          <label>
            Name
            <input type="text" placeholder="Your name" readOnly={step !== 'details'} {...register('name')} />
            {errors.name && <small>{errors.name.message}</small>}
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" readOnly={step !== 'details'} {...register('email')} />
            {errors.email && <small>{errors.email.message}</small>}
          </label>
          {step === 'details' && (
            <button className="primary-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          )}
          {step === 'otp' && (
            <>
              <label>
                OTP
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </label>
              <button className="primary-button" type="button" disabled={isLoading} onClick={verifyOtp}>
                {isLoading ? 'Verifying...' : 'Verify email'}
              </button>
              <button
                className="primary-button"
                type="submit"
                disabled={isLoading}
                style={{ background: 'rgba(15, 23, 42, 0.68)', border: '1px solid var(--border)', boxShadow: 'none' }}
              >
                Resend OTP
              </button>
            </>
          )}
          {step === 'password' && (
            <>
              <label>
                Password
                <input type="password" placeholder="At least 6 characters" {...register('password')} />
                {errors.password && <small>{errors.password.message}</small>}
              </label>
              <button className="primary-button" type="button" disabled={isLoading} onClick={createAccount}>
                {isLoading ? 'Creating...' : 'Create account'}
              </button>
            </>
          )}
        </form>
        <p className="auth-switch">Already listening? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
};

export default Register;

import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, Navigate } from 'react-router-dom';
import AppLogo from '../../components/common/AppLogo';
import useAuthStore from '../../store/authStore';
import { GoogleLogin } from '@react-oauth/google';

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
    googleLogin,
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

        {step === 'details' && (
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
                    navigate('/', { replace: true });
                  } else {
                    toast.error(result?.message || 'Google Register failed');
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
        )}

        <p className="auth-switch">Already listening? <Link to="/login">Sign in</Link></p>
        <div style={{ marginTop: '14px', paddingTop: '18px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '12px' }}>Want a native experience?</p>
          <a href="https://github.com/Kaushik2105/Ragas-Mobile/releases/download/v1.0.5/ragas-v1.0.5.apk" target="_blank" rel="noopener noreferrer" className="ghost-button" style={{ width: '100%', textDecoration: 'none' }}>
            <Smartphone size={18} /> Download the Mobile App
          </a>
        </div>
      </section>
    </main>
  );
};

export default Register;

import { useState } from 'react';
import { Smartphone, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GoogleLogin } from '@react-oauth/google';
import AppLogo from '../common/AppLogo';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().optional(),
});

const AuthModal = () => {
  const { authModal, closeAuthModal, switchAuthMode } = useUIStore();
  const {
    login,
    googleLogin,
    requestRegistrationOtp,
    verifyRegistrationOtp,
    register: registerUser,
    isLoading,
  } = useAuthStore();

  const [regStep, setRegStep] = useState('details'); // 'details' | 'otp' | 'password'
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm({ resolver: zodResolver(loginSchema) });

  const {
    register: regRegister,
    handleSubmit: handleRegSubmit,
    getValues: getRegValues,
    formState: { errors: regErrors },
    reset: resetRegForm,
  } = useForm({ resolver: zodResolver(registerSchema) });

  if (!authModal?.isOpen) return null;

  const isLogin = authModal.mode === 'login';

  const handleClose = () => {
    resetLoginForm();
    resetRegForm();
    setRegStep('details');
    setOtp('');
    setVerificationToken('');
    closeAuthModal();
  };

  const onLoginSubmit = async (data) => {
    const result = await login(data);
    if (result?.success) {
      toast.success('Welcome back to RAGAS');
      handleClose();
    } else {
      toast.error(result?.message || 'Login failed');
    }
  };

  const onRequestOtp = async (data) => {
    const result = await requestRegistrationOtp({ name: data.name, email: data.email });
    if (result?.success) {
      toast.success('OTP sent to your email.');
      setRegStep('otp');
    } else {
      toast.error(result?.message || 'Could not send OTP');
    }
  };

  const onVerifyOtp = async () => {
    const email = getRegValues('email');
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error('Enter the 6-digit OTP.');
      return;
    }

    const result = await verifyRegistrationOtp({ email, otp: otp.trim() });
    if (result?.success) {
      setVerificationToken(result.verificationToken);
      setRegStep('password');
      toast.success('Email verified.');
    } else {
      toast.error(result?.message || 'OTP verification failed');
    }
  };

  const onCompleteRegister = async () => {
    const { email, password } = getRegValues();
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    const result = await registerUser({ email, password, verificationToken });
    if (result?.success) {
      toast.success('Account created. Welcome to RAGAS!');
      handleClose();
    } else {
      toast.error(result?.message || 'Registration failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await googleLogin(credentialResponse.credential);
    if (result?.success) {
      toast.success('Welcome to RAGAS');
      handleClose();
    } else {
      toast.error(result?.message || 'Google Sign-In failed');
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={handleClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="auth-modal-close"
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-logo">
            <AppLogo />
          </div>
          <h2 className="auth-modal-title">
            {isLogin ? 'Log In to RAGAS' : 'Create an Account'}
          </h2>
          <p className="auth-modal-subtitle">
            {isLogin
              ? 'Sign in to play songs, save favorites, and create playlists.'
              : 'Join the stream to start listening and exploring music.'}
          </p>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form className="auth-compact-form" onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <div className="auth-compact-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...loginRegister('email')}
              />
              {loginErrors.email && <small className="auth-err">{loginErrors.email.message}</small>}
            </div>

            <div className="auth-compact-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...loginRegister('password')}
              />
              {loginErrors.password && <small className="auth-err">{loginErrors.password.message}</small>}
            </div>

            <button className="primary-button auth-submit-btn" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin" /> Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <div className="auth-compact-form">
            {regStep === 'details' && (
              <form onSubmit={handleRegSubmit(onRequestOtp)} className="auth-compact-form">
                <div className="auth-compact-field">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    autoComplete="name"
                    {...regRegister('name')}
                  />
                  {regErrors.name && <small className="auth-err">{regErrors.name.message}</small>}
                </div>

                <div className="auth-compact-field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...regRegister('email')}
                  />
                  {regErrors.email && <small className="auth-err">{regErrors.email.message}</small>}
                </div>

                <button className="primary-button auth-submit-btn" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="spin" /> Sending OTP…
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </form>
            )}

            {regStep === 'otp' && (
              <div className="auth-compact-form">
                <div className="auth-compact-field">
                  <label>Enter 6-digit OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                  />
                </div>

                <div className="auth-otp-actions">
                  <button
                    className="primary-button auth-submit-btn"
                    type="button"
                    disabled={isLoading}
                    onClick={onVerifyOtp}
                  >
                    {isLoading ? 'Verifying…' : 'Verify Email'}
                  </button>
                  <button
                    className="ghost-button auth-resend-btn"
                    type="button"
                    disabled={isLoading}
                    onClick={() => onRequestOtp(getRegValues())}
                  >
                    Resend
                  </button>
                </div>
              </div>
            )}

            {regStep === 'password' && (
              <div className="auth-compact-form">
                <div className="auth-compact-field">
                  <label>Set Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    {...regRegister('password')}
                    autoFocus
                  />
                  {regErrors.password && <small className="auth-err">{regErrors.password.message}</small>}
                </div>

                <button
                  className="primary-button auth-submit-btn"
                  type="button"
                  disabled={isLoading}
                  onClick={onCompleteRegister}
                >
                  {isLoading ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Google Login (only on login or initial register step) */}
        {(isLogin || regStep === 'details') && (
          <div className="auth-modal-divider-row">
            <div className="auth-modal-divider">
              <span />
              <small>OR</small>
              <span />
            </div>

            <div className="auth-modal-google">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Sign-In failed')}
                theme="filled_blue"
                shape="pill"
                text={isLogin ? 'continue_with' : 'signup_with'}
                size="medium"
                width="280"
              />
            </div>
          </div>
        )}

        {/* Switch Mode */}
        <p className="auth-modal-switch">
          {isLogin ? (
            <>
              New to Ragas?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setRegStep('details');
                  switchAuthMode('register');
                }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => switchAuthMode('login')}
              >
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Download App Footer */}
        <div className="auth-modal-app-footer">
          <a
            href="https://github.com/Kaushik2105/Ragas-Mobile/releases/download/v1.0.7/ragas-v1.0.7.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="auth-app-download-btn"
          >
            <Smartphone size={15} /> Download Mobile App (Android APK)
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

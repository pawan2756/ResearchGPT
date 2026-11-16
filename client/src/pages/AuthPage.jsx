import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';

export function AuthPage() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect
  if (user) {
    const from = location.state?.from?.pathname || '/chat';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      const from = location.state?.from?.pathname || '/chat';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row items-stretch"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Left Column: Navy Brand Panel */}
      <div
        className="flex-1 flex flex-col justify-between p-8 md:p-16 text-white"
        style={{ backgroundColor: 'var(--nav-bg)' }}
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          <span className="text-[20px] font-bold tracking-tight">ResearchGPT</span>
        </div>

        <div className="my-12 md:my-0 max-w-lg">
          <h1 className="text-[28px] md:text-[38px] font-bold leading-tight mb-4">
            Answers you can trace to a source.
          </h1>
          <p className="text-[16px] md:text-[18px] text-[var(--nav-text)] leading-relaxed mb-8">
            Ask first. Research online only when you say yes. Every claim arrives with its sources.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--nav-hover)]">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 mt-0.5" style={{ color: 'var(--primary)' }} />
              <div>
                <h4 className="text-[14px] font-semibold text-white">Consented Research</h4>
                <p className="text-[12px] text-[var(--nav-text)] opacity-80">
                  Instant answers first. Live web search only when needed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 mt-0.5" style={{ color: 'var(--primary)' }} />
              <div>
                <h4 className="text-[14px] font-semibold text-white">Source Verification</h4>
                <p className="text-[12px] text-[var(--nav-text)] opacity-80">
                  Atomic claim verification with exact quoted citations.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[12px] text-[var(--nav-text)] opacity-60">
          Explainable AI Research Assistant &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* Right Column: 380px Auth Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div
          className="w-full max-w-[380px] rounded-[12px] p-6 shadow-sm border"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Tabs: Log in / Sign up */}
          <div
            className="flex p-1 rounded-[8px] mb-6"
            style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-1.5 text-[14px] font-semibold rounded-[6px] transition-colors ${
                mode === 'login' ? 'shadow-sm text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              style={{
                backgroundColor: mode === 'login' ? 'var(--primary)' : 'transparent',
              }}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-1.5 text-[14px] font-semibold rounded-[6px] transition-colors ${
                mode === 'signup' ? 'shadow-sm text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              style={{
                backgroundColor: mode === 'signup' ? 'var(--primary)' : 'transparent',
              }}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
            />

            {error && (
              <div
                className="p-3 rounded-[8px] text-[13px] border"
                style={{
                  backgroundColor: 'var(--danger-bg)',
                  color: 'var(--danger-text)',
                  borderColor: 'var(--danger-text)',
                }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              className="w-full mt-2"
            >
              {mode === 'signup' ? 'Create Account' : 'Sign in to ResearchGPT'}
            </Button>
          </form>

          <p className="text-[12px] text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="font-semibold underline cursor-pointer"
                  style={{ color: 'var(--primary)' }}
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                New to ResearchGPT?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="font-semibold underline cursor-pointer"
                  style={{ color: 'var(--primary)' }}
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

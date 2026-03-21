import { useState } from 'react';
import { useAuth } from './AuthContext';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode]       = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setDone(true);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>

        {done ? (
          <div className="auth-done">
            <div className="auth-done-icon">✉</div>
            <div className="auth-done-title">Check your email</div>
            <div className="auth-done-sub">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.</div>
            <button className="auth-btn" onClick={() => { setMode('signin'); setDone(false); }}>
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="auth-title">{mode === 'signin' ? 'Sign In' : 'Create Account'}</div>
            <div className="auth-sub">
              {mode === 'signin' ? 'Save and access your calculations' : 'Free account — save your heat loss calculations'}
            </div>

            <form onSubmit={submit} className="auth-form">
              <label className="auth-label">
                Email
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </label>
              <label className="auth-label">
                Password
                <input
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : ''}
                  required
                  minLength={6}
                />
              </label>

              {error && <div className="auth-error">{error}</div>}

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="auth-switch">
              {mode === 'signin' ? (
                <>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); }}>Sign up free</button></>
              ) : (
                <>Already have an account? <button onClick={() => { setMode('signin'); setError(''); }}>Sign in</button></>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

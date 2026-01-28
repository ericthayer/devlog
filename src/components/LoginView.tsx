import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrutalistButton } from './BrutalistButton';
import { Icon } from './Icon';

export const LoginView: React.FC = () => {
  const { signIn, signUp, signInWithProvider } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requestPublisher, setRequestPublisher] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Always sign up as reader, save publisher request for admin approval
        await signUp(email, password, 'reader', requestPublisher);
        if (requestPublisher) {
          setSuccess('Account created! Publisher access requires admin approval. Check your email.');
        }
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(true);
    
    try {
      await signInWithProvider(provider);
    } catch (err: any) {
      setError(err.message || `${provider} sign-in failed`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#666666] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white brutalist-border brutalist-shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">
            {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </h1>
          <p className="text-sm text-gray-600 mono">
            {isSignUp ? 'Join the case study engine' : 'Access your case studies'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 brutalist-border border-red-600 text-red-600 text-sm font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 brutalist-border border-green-600 text-green-600 text-sm font-bold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold mb-2 mono">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 brutalist-border focus:outline-none focus:border-amber-300 bg-white mono"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 mono">PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 brutalist-border focus:outline-none focus:border-amber-300 bg-white mono"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold mb-3 mono">ACCOUNT TYPE</label>
              <div className="space-y-3">
                <div className="p-4 brutalist-border bg-amber-50">
                  <div className="flex items-center gap-2">
                    <Icon name="BookOpen" size={16} />
                    <span className="mono text-sm font-bold">READER ACCESS (Default)</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 mono">
                    View published case studies only
                  </p>
                </div>

                <label className="flex items-start gap-3 p-4 brutalist-border bg-white cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={requestPublisher}
                    onChange={(e) => setRequestPublisher(e.target.checked)}
                    className="w-5 h-5 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon name="Crown" size={16} />
                      <span className="mono text-sm font-bold">REQUEST PUBLISHER ACCESS</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 mono">
                      Create, edit, and delete case studies (requires admin approval)
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          <BrutalistButton
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </BrutalistButton>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
            className="w-full text-center text-sm mono text-gray-600 hover:text-black underline font-bold"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t-4 border-black">
          <p className="text-xs mono text-gray-500 mb-4">OR CONTINUE WITH</p>
          <div className="space-y-3">
            <BrutalistButton
              variant="secondary"
              fullWidth
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="flex items-center justify-center gap-3"
            >
              <Icon name="Chrome" size={20} />
              <span>Google</span>
            </BrutalistButton>
            <BrutalistButton
              variant="secondary"
              fullWidth
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
              className="flex items-center justify-center gap-3"
            >
              <Icon name="Github" size={20} />
              <span>GitHub</span>
            </BrutalistButton>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-4 border-black">
          <p className="text-xs mono text-gray-500">
            ROLE PERMISSIONS:
          </p>
          <ul className="mt-2 space-y-1 text-xs mono text-gray-600">
            <li>• PUBLISHER: Create, edit, delete case studies (approval required)</li>
            <li>• READER: View published case studies</li>
          </ul>
        </div>
      </div>
    </div>
  );
};


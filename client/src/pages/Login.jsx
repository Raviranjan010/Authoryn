import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0] px-6 py-20 font-sans">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Editorial Header */}
        <div className="text-center md:text-left space-y-2">
          <Link to="/" className="text-3xl font-semibold tracking-tight text-[#111111] font-sans">
            Authoryn<span className="text-[#5B4FE8]">.</span>
          </Link>
          <p className="text-xs text-[#666666] tracking-wider uppercase font-light">
            Welcome back. Log in to continue.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 border border-red-600/30 bg-red-600/5 text-red-600 text-xs font-semibold rounded-[4px]">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-[15px] font-light"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-[15px] font-light"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4.5 h-4.5 text-[#5B4FE8] bg-transparent border-[#111111]/30 rounded focus:ring-0 accent-[#5B4FE8]"
            />
            <label htmlFor="rememberMe" className="text-xs text-[#666666] select-none font-light cursor-pointer">
              Remember me for 7 days
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-outline py-3 mt-4 text-sm font-semibold tracking-wider uppercase flex justify-center items-center"
          >
            {submitting ? (
              <div className="w-5 h-5 border-t-2 border-r-2 border-[#F7F5F0] rounded-full animate-spin"></div>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="text-center md:text-left text-xs text-[#666666] font-light">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#5B4FE8] font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

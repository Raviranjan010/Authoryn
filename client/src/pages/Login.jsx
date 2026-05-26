import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      await login(email, password, rememberMe);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100-80px)] flex items-center justify-center bg-background px-6 py-20 font-sans">
      <div className="w-full max-w-[400px] bg-white border border-border-light rounded-2xl shadow-premium p-8 text-left space-y-6">
        
        {/* Editorial Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-soft-accent/30 rounded-2xl text-accent-green text-3xl">
              <RiLeafLine />
            </div>
          </div>
          <h2 className="text-2xl font-bold font-serif text-text-primary">Welcome back</h2>
          <p className="text-xs text-text-secondary tracking-wide uppercase font-semibold">
            Log in to continue to workspace.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3.5 text-text-secondary text-base" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-light focus:border-accent-green rounded-xl focus:outline-none text-[14px] font-medium transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-3.5 text-text-secondary text-base" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-light focus:border-accent-green rounded-xl focus:outline-none text-[14px] font-medium transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-accent-green bg-transparent border-border-light rounded focus:ring-0 accent-accent-green"
            />
            <label htmlFor="rememberMe" className="text-xs text-text-secondary select-none font-medium cursor-pointer">
              Remember me for 7 days
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-3 mt-4 text-sm font-semibold tracking-wider uppercase flex justify-center items-center shadow-sm"
          >
            {submitting ? (
              <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-text-secondary font-medium pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-green hover:underline font-bold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

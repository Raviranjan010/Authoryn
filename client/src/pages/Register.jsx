import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Basic username format check
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      setError('Username can only contain alphanumeric characters, underscores, and dashes');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await register(name, email, username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different username/email.');
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
            Create an account. Defy gravity.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 border border-red-600/30 bg-red-600/5 text-red-600 text-xs font-semibold rounded-[4px]">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-[15px] font-light"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-[15px] font-light"
              placeholder="jane@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-[15px] font-light"
              placeholder="janedoe"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-[15px] font-light"
              placeholder="•••••••• (min 6 chars)"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-outline py-3 mt-4 text-sm font-semibold tracking-wider uppercase flex justify-center items-center"
          >
            {submitting ? (
              <div className="w-5 h-5 border-t-2 border-r-2 border-[#F7F5F0] rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center md:text-left text-xs text-[#666666] font-light">
          Already have an account?{' '}
          <Link to="/login" className="text-[#5B4FE8] font-semibold hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

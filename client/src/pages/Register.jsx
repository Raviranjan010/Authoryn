import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be 6 or more characters');
      return;
    }

    setSubmitting(true);

    try {
      await register(name, email, username, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to register account. Username or email may already be taken.');
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
          <h2 className="text-2xl font-bold font-serif text-text-primary">Create account</h2>
          <p className="text-xs text-text-secondary tracking-wide uppercase font-semibold">
            Join the LeafBlog writer community.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="name" className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-3.5 text-text-secondary text-base" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-light focus:border-accent-green rounded-xl focus:outline-none text-[14px] font-medium transition-colors"
                placeholder="Alex Johnson"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label htmlFor="username" className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-text-secondary text-[14px] font-medium font-mono">@</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-background border border-border-light focus:border-accent-green rounded-xl focus:outline-none text-[14px] font-medium transition-colors"
                placeholder="alexj"
                required
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-3 mt-4 text-sm font-semibold tracking-wider uppercase flex justify-center items-center shadow-sm"
          >
            {submitting ? (
              <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-text-secondary font-medium pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-green hover:underline font-bold">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

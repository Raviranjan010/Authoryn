import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Sync state if initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password, rememberMe);
        toast.success('Logged in successfully!');
      } else {
        await register(name, email, username, password);
        toast.success('Registered successfully!');
      }
      onClose();
      // Clear forms
      setEmail('');
      setPassword('');
      setName('');
      setUsername('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-dark-section/40 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-[400px] bg-white border border-border-light rounded-2xl shadow-float p-8 z-10 mx-4"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-text-secondary hover:text-accent-green hover:bg-background rounded-full transition-colors cursor-pointer"
          >
            <FiX className="text-xl" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-soft-accent/30 rounded-2xl text-accent-green text-3xl">
                <RiLeafLine />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary font-serif">
              {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {activeTab === 'login' ? 'Access your LeafBlog writer dashboard' : 'Join our creative writing community'}
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 bg-background p-1.5 rounded-full mb-6 border border-border-light/40">
            <button 
              type="button"
              onClick={() => setActiveTab('login')}
              className={`py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${activeTab === 'login' ? 'bg-white text-accent-green shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Log In
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('register')}
              className={`py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${activeTab === 'register' ? 'bg-white text-accent-green shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {activeTab === 'register' && (
              <>
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-3.5 text-text-secondary text-base" />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Johnson"
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-light focus:border-accent-green rounded-xl focus:outline-none text-[14px] font-medium transition-colors"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-text-secondary text-[14px] font-medium">@</span>
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="alexj"
                      className="w-full pl-8 pr-4 py-2.5 bg-background border border-border-light focus:border-accent-green rounded-xl focus:outline-none text-[14px] font-medium transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3.5 text-text-secondary text-base" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-light focus:border-accent-green rounded-xl focus:outline-none text-[14px] font-medium transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3.5 text-text-secondary text-base" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-light focus:border-accent-green rounded-xl focus:outline-none text-[14px] font-medium transition-colors"
                />
              </div>
            </div>

            {activeTab === 'login' && (
              <div className="flex items-center space-x-2 pt-1">
                <input 
                  id="rememberMeModal"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-accent-green bg-transparent border-border-light rounded focus:ring-0 accent-accent-green"
                />
                <label htmlFor="rememberMeModal" className="text-xs text-text-secondary select-none font-medium cursor-pointer">
                  Remember me for 7 days
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-green hover:bg-dark-green text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer mt-4 flex justify-center items-center shadow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
              ) : (
                activeTab === 'login' ? 'Log In' : 'Sign Up'
              )}
            </button>
          </form>

          {/* Footer toggle */}
          <div className="text-center text-xs text-text-secondary mt-6 font-medium">
            {activeTab === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button onClick={() => setActiveTab('register')} className="text-accent-green hover:underline font-bold cursor-pointer">
                  Sign up free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={() => setActiveTab('login')} className="text-accent-green hover:underline font-bold cursor-pointer">
                  Log in here
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;

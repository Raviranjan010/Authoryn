import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiLeafLine } from 'react-icons/ri';
import { FiMail } from 'react-icons/fi';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await api.post('/api/subscribers', { email });
      if (response.data.success) {
        toast.success(response.data.message || 'Subscribed successfully!');
        setEmail('');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-border-light pt-12 pb-8 px-6 md:px-12 mt-auto font-sans">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-border-light/60">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-4 text-left">
          <Link to="/" className="flex items-center space-x-2 brand-mark text-xl font-bold text-text-primary hover:opacity-85 transition-opacity">
            <RiLeafLine className="text-accent-green text-2xl" />
            <span className="font-sans font-bold">Authoryn</span>
          </Link>
          <p className="text-xs text-text-secondary max-w-sm leading-relaxed font-light">
            A premium block-based publishing workspace for writers, creators, and professionals. Write elegant stories, engage readers, and grow your subscriber base.
          </p>
        </div>

        {/* Newsletter Subscription Column */}
        <div className="md:col-span-7 space-y-3 text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Subscribe to our newsletter
          </h4>
          <p className="text-xs text-text-secondary font-light max-w-md">
            Get premium editorial digests, new features, and direct insights from top authors, delivered straight to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-lg">
            <div className="relative flex-grow">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/60 text-sm" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full bg-background border border-border-light rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-green shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent-green hover:bg-accent-green-dark text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-75 flex items-center justify-center min-w-[120px]"
            >
              {loading ? (
                <div className="w-4.5 h-4.5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 text-xs text-text-secondary">
        <div className="text-left">
          &copy; {currentYear} Authoryn. All rights reserved.
        </div>
        <div className="flex space-x-6 font-semibold">
          <Link to="/about" className="hover:text-accent-green transition-colors">Privacy Policy</Link>
          <Link to="/about" className="hover:text-accent-green transition-colors">Terms of Service</Link>
          <Link to="/about" className="hover:text-accent-green transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

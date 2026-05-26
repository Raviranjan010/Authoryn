import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FiSearch, FiMenu, FiX, FiPlus, FiUser, FiSettings, FiLogOut, FiLayout } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import AuthModal from './AuthModal';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const openAuth = (tab) => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="w-full bg-background border-b border-border-light sticky top-0 z-40 px-6 py-4 md:px-12 flex items-center justify-between">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center space-x-2 brand-mark text-2xl font-bold tracking-tight text-text-primary hover:opacity-90 transition-opacity">
          <RiLeafLine className="text-accent-green text-3xl animate-pulse" />
          <span className="text-text-primary font-sans font-bold tracking-tight">LeafBlog</span>
        </Link>

        {/* Center: Links */}
        <div className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-text-secondary">
          <Link 
            to="/" 
            className={`hover-underline hover:text-text-primary transition-colors py-1 ${isActive('/') ? 'text-accent-green font-semibold border-b-2 border-accent-green' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/explore" 
            className={`hover-underline hover:text-text-primary transition-colors py-1 ${isActive('/explore') ? 'text-accent-green font-semibold border-b-2 border-accent-green' : ''}`}
          >
            Explore
          </Link>
          <Link 
            to="/about" 
            className={`hover-underline hover:text-text-primary transition-colors py-1 ${isActive('/about') ? 'text-accent-green font-semibold border-b-2 border-accent-green' : ''}`}
          >
            About
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {/* Explore Search button */}
          <Link 
            to="/explore" 
            className="p-2 text-text-secondary hover:text-accent-green transition-colors rounded-full hover:bg-soft-accent/30"
            title="Search Blogs"
          >
            <FiSearch className="text-xl" />
          </Link>

          {user ? (
            <>
              {/* Write Button */}
              <Link 
                to="/write" 
                className="hidden md:inline-flex items-center space-x-1.5 px-4.5 py-2 bg-accent-green hover:bg-dark-green text-white text-[14px] font-semibold rounded-full transition-all duration-200 shadow-sm"
              >
                <FiPlus className="text-lg" />
                <span>New Post</span>
              </Link>
              
              {/* User Dropdown */}
              <div className="relative font-sans">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden border border-border-light hover:border-accent-green transition-colors cursor-pointer focus:outline-none"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar.startsWith('/') ? `http://localhost:5000${user.avatar}` : user.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-accent-green text-white flex items-center justify-center text-sm font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white border border-border-light rounded-xl shadow-float py-2 z-50 text-[14px] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-border-light text-xs">
                      <p className="font-bold text-text-primary truncate">{user.name}</p>
                      <p className="text-text-secondary truncate">@{user.username}</p>
                    </div>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setDropdownOpen(false)} 
                      className="flex items-center space-x-2 px-4 py-2 text-text-primary hover:bg-background transition-colors"
                    >
                      <FiLayout className="text-text-secondary" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      to="/settings" 
                      onClick={() => setDropdownOpen(false)} 
                      className="flex items-center space-x-2 px-4 py-2 text-text-primary hover:bg-background transition-colors"
                    >
                      <FiSettings className="text-text-secondary" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1 border-border-light" />
                    <button 
                      onClick={() => { handleLogout(); setDropdownOpen(false); }} 
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer"
                    >
                      <FiLogOut />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <button 
                onClick={() => openAuth('login')} 
                className="text-[14px] font-semibold text-text-primary hover:text-accent-green transition-colors px-3 py-2 cursor-pointer"
              >
                Log in
              </button>
              <button 
                onClick={() => openAuth('register')} 
                className="px-5 py-2 bg-accent-green hover:bg-dark-green text-white text-[14px] font-semibold rounded-full transition-all duration-200 shadow-sm cursor-pointer"
              >
                Sign up
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-primary hover:bg-soft-accent/30 rounded-full transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border-light px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3 font-medium text-text-secondary">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`hover:text-accent-green transition-colors py-1 ${isActive('/') ? 'text-accent-green font-semibold' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/explore" 
              onClick={() => setMobileMenuOpen(false)}
              className={`hover:text-accent-green transition-colors py-1 ${isActive('/explore') ? 'text-accent-green font-semibold' : ''}`}
            >
              Explore
            </Link>
            <Link 
              to="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className={`hover:text-accent-green transition-colors py-1 ${isActive('/about') ? 'text-accent-green font-semibold' : ''}`}
            >
              About
            </Link>
          </div>
          <hr className="border-border-light" />
          <div className="flex flex-col space-y-3 pt-1">
            {user ? (
              <>
                <Link 
                  to="/write" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 bg-accent-green text-white rounded-full font-medium"
                >
                  Write Post
                </Link>
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 border border-border-light rounded-full font-medium text-text-primary"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full text-center px-4 py-2 bg-red-50 text-red-600 rounded-full font-medium cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => openAuth('login')}
                  className="w-full text-center px-4 py-2 border border-border-light rounded-full font-medium text-text-primary cursor-pointer"
                >
                  Log in
                </button>
                <button 
                  onClick={() => openAuth('register')}
                  className="w-full text-center px-4 py-2 bg-accent-green text-white rounded-full font-medium cursor-pointer"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab={authModalTab} 
      />
    </>
  );
};

export default Navbar;

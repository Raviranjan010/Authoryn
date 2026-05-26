import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-[#F7F5F0] transition-all duration-200 ${
        scrolled ? 'border-t-2 border-[#111111]/30 py-4' : 'border-t-2 border-transparent py-5'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
        {/* Logo Left */}
        <Link to="/" className="text-2xl font-semibold tracking-tight text-[#111111]">
          Authoryn<span className="text-[#5B4FE8]">.</span>
        </Link>

        {/* Links Center */}
        <div className="hidden md:flex space-x-8 items-center text-sm font-medium tracking-wide">
          <Link to="/" className="text-[#111111] hover-underline">
            Feed
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="text-[#111111] hover-underline">
                Dashboard
              </Link>
              <Link to="/write" className="text-[#111111] hover-underline">
                Write
              </Link>
            </>
          )}
        </div>

        {/* Auth Buttons Right */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to={`/author/${user.username}`} className="flex items-center space-x-2">
                {user.avatar ? (
                  <img
                    src={user.avatar.startsWith('/') ? `http://localhost:5000${user.avatar}` : user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#111111]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-xs font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-[#111111] hover:text-[#5B4FE8] transition-colors">
                  @{user.username}
                </span>
              </Link>
              <button onClick={handleLogout} className="btn-outline text-xs px-3 py-1.5">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-xs font-medium text-[#111111] hover:text-[#5B4FE8] transition-colors px-3 py-1.5">
                Login
              </Link>
              <Link to="/register" className="btn-outline text-xs px-3.5 py-1.5">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

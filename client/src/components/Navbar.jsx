import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`fixed left-0 top-0 z-50 w-full px-4 py-4 transition-all duration-200 sm:px-6 lg:px-8 ${scrolled ? 'bg-[#fbfaf6]/88 shadow-[0_12px_40px_rgba(16,17,22,0.08)] backdrop-blur' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-[1780px] items-center justify-between gap-4">
        <Link to="/" className="brand-mark text-2xl font-semibold tracking-tight text-[#101116]">
          Authoryn <span aria-hidden="true">✦</span>
        </Link>

        <div className="hidden rounded-full border border-[#101116]/10 bg-white/78 px-2 py-2 shadow-[0_10px_35px_rgba(16,17,22,0.06)] backdrop-blur md:flex">
          <Link to="/" className="top-nav-link active">Home</Link>
          <Link to="/tag/design" className="top-nav-link">Tags</Link>
          {user && <Link to="/dashboard" className="top-nav-link">Dashboard</Link>}
          {user && <Link to="/write" className="top-nav-link">Write</Link>}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to={`/author/${user.username}`} className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar.startsWith('/') ? `http://localhost:5000${user.avatar}` : user.avatar}
                    alt={user.name}
                    className="h-9 w-9 rounded-full border border-[#101116]/15 object-cover"
                  />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[#101116] text-xs font-bold uppercase text-[#fbfaf6]">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden text-sm font-bold text-[#101116] sm:inline">@{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="btn-soft hidden sm:inline-flex">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm font-bold text-[#101116] transition hover:text-[#2932ff] sm:inline">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

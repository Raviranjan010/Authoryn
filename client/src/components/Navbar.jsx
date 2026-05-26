import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full px-6 py-6 md:px-12 flex items-center justify-between bg-transparent relative z-50">
      {/* Brand */}
      <Link to="/" className="brand-mark text-3xl md:text-4xl font-bold tracking-tight text-[#111111]">
        Authoryn <span className="text-[#5B4FE8]">✦</span>
      </Link>

      {/* Center Links (Optional, if we want them) */}
      <div className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-[#111111]">
        <Link to="/" className="hover-underline">Home</Link>
        <Link to="/tag/technology" className="hover-underline">Technology</Link>
        <Link to="/tag/design" className="hover-underline">Design</Link>
        <Link to="/tag/culture" className="hover-underline">Culture</Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/write" className="hidden md:inline-flex items-center space-x-2 text-[15px] font-medium text-[#111111] hover:text-[#5B4FE8] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              <span>Write</span>
            </Link>
            
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-[#5B4FE8] transition-colors cursor-pointer"
              >
                {user.avatar ? (
                  <img src={user.avatar.startsWith('/') ? `http://localhost:5000${user.avatar}` : user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-sm font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#ffffff] border border-[#111111]/10 rounded shadow-lg py-2 z-50 text-[15px]">
                  <div className="px-4 py-2 border-b border-[#111111]/10 text-sm">
                    <p className="font-bold text-[#111111]">{user.name}</p>
                    <p className="text-[#666666]">@{user.username}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-[#111111] hover:bg-[#F7F5F0]">Dashboard</Link>
                  <Link to="/settings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-[#111111] hover:bg-[#F7F5F0]">Settings</Link>
                  <button onClick={() => { handleLogout(); setDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-[#F7F5F0]">Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-[15px] font-medium text-[#111111] hover:text-[#5B4FE8] transition-colors mr-2">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

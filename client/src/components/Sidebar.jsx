import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FiFileText, FiPlus, FiSettings, FiLogOut, FiLayout, FiChevronRight } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUrl';

export const Sidebar = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: FiLayout,
    },
    {
      name: 'Write Post',
      path: '/write',
      icon: FiPlus,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: FiSettings,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`w-full bg-white border border-border-light rounded-xl p-6 space-y-6 shadow-premium font-sans ${className}`}>
      {/* Profile summary card */}
      <div className="flex items-center space-x-3 pb-4 border-b border-border-light">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-border-light bg-accent-green text-white flex items-center justify-center font-bold text-lg uppercase shadow-sm">
          {user?.avatar ? (
            <img 
              src={getImageUrl(user.avatar)} 
              alt={user.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            user?.name?.charAt(0)
          )}
        </div>
        <div className="truncate">
          <h4 className="text-sm font-bold text-text-primary truncate">{user?.name}</h4>
          <p className="text-xs text-text-secondary truncate">@{user?.username}</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="space-y-1 text-sm font-semibold text-text-secondary">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                active 
                  ? 'bg-soft-accent/30 text-accent-green' 
                  : 'hover:bg-background hover:text-text-primary'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`text-base ${active ? 'text-accent-green' : 'text-text-secondary group-hover:text-text-primary'}`} />
                <span>{item.name}</span>
              </div>
              <FiChevronRight className={`text-xs opacity-0 transition-opacity ${active ? 'opacity-100 text-accent-green' : 'group-hover:opacity-60'}`} />
            </Link>
          );
        })}
        
        {/* Log Out button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2.5 w-full text-left px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50/50 transition-all font-semibold cursor-pointer group"
        >
          <FiLogOut className="text-base text-red-600 group-hover:translate-x-0.5 transition-transform" />
          <span>Log Out</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;

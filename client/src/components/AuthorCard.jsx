import React from 'react';
import { Link } from 'react-router-dom';

export const AuthorCard = ({ author }) => {
  if (!author) return null;

  return (
    <div className="border-t border-b border-border-light py-8 my-10 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left font-sans">
      {/* Avatar */}
      <Link to={`/author/${author.username}`}>
        {author.avatar ? (
          <img
            src={author.avatar.startsWith('/') ? `http://localhost:5000${author.avatar}` : author.avatar}
            alt={author.name}
            className="w-16 h-16 rounded-full object-cover border border-border-light hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-accent-green text-white flex items-center justify-center text-xl font-bold uppercase hover:scale-105 transition-transform duration-200 shadow-sm">
            {author.name.charAt(0)}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <Link to={`/author/${author.username}`} className="text-[17px] font-bold font-serif text-text-primary hover:text-accent-green transition-colors">
            {author.name}
          </Link>
          <Link
            to={`/author/${author.username}`}
            className="text-xs font-bold text-accent-green hover-underline mt-1 sm:mt-0"
          >
            View all posts →
          </Link>
        </div>
        <p className="text-[14px] leading-relaxed text-text-secondary font-light max-w-2xl">
          {author.bio || 'This author has not provided a biography yet.'}
        </p>
      </div>
    </div>
  );
};

export default AuthorCard;

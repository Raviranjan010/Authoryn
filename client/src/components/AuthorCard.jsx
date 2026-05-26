import React from 'react';
import { Link } from 'react-router-dom';

export const AuthorCard = ({ author }) => {
  if (!author) return null;

  return (
    <div className="border-t border-b border-[#111111]/15 py-8 my-10 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left font-sans">
      {/* Avatar */}
      <Link to={`/author/${author.username}`}>
        {author.avatar ? (
          <img
            src={author.avatar.startsWith('/') ? `http://localhost:5000${author.avatar}` : author.avatar}
            alt={author.name}
            className="w-16 h-16 rounded-full object-cover border border-[#111111] hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-xl font-bold uppercase hover:scale-105 transition-transform duration-200">
            {author.name.charAt(0)}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <Link to={`/author/${author.username}`} className="text-[17px] font-semibold font-serif text-[#111111] hover:text-[#5B4FE8] transition-colors">
            {author.name}
          </Link>
          <Link
            to={`/author/${author.username}`}
            className="text-xs font-semibold text-[#5B4FE8] hover-underline mt-1 sm:mt-0"
          >
            View all posts →
          </Link>
        </div>
        <p className="text-[14px] leading-relaxed text-[#666666] font-light max-w-2xl">
          {author.bio || 'This author has not provided a biography yet.'}
        </p>
      </div>
    </div>
  );
};

export default AuthorCard;

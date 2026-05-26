import React from 'react';
import { Link } from 'react-router-dom';
import { calculateReadTime } from '../utils/readTime';
import { formatAbsoluteDate } from '../utils/formatDate';
import { FiEye, FiHeart } from 'react-icons/fi';

export const BlogCard = ({ post }) => {
  // Strip HTML for clear text excerpt
  const plainTextExcerpt = post.content
    ? post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  const readTime = calculateReadTime(post.content);
  const likesCount = post.likes ? post.likes.length : 0;

  const thumbnailFallback = 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=600&q=80';
  
  const thumbnailUrl = post.thumbnail
    ? (post.thumbnail.startsWith('/') ? `http://localhost:5000${post.thumbnail}` : post.thumbnail)
    : thumbnailFallback;

  return (
    <article className="premium-card bg-white flex flex-col h-full overflow-hidden hover:shadow-premium group">
      {/* Thumbnail Container */}
      <Link to={`/post/${post.slug}`} className="block relative aspect-video overflow-hidden bg-gray-100 border-b border-border-light">
        <img 
          src={thumbnailUrl} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => { e.target.src = thumbnailFallback; }}
        />
        {post.category && (
          <span className="absolute top-4 left-4 bg-accent-green/90 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md backdrop-blur-sm">
            {post.category}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Read time and views row */}
          <div className="flex items-center space-x-3 text-[11px] font-bold text-text-secondary font-sans uppercase tracking-wider">
            <span>{readTime}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <FiEye className="text-xs" />
              <span>{post.viewCount || 0}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <FiHeart className="text-xs" />
              <span>{likesCount}</span>
            </span>
          </div>

          {/* Title */}
          <Link to={`/post/${post.slug}`} className="block group/title">
            <h3 className="text-lg font-bold font-serif text-text-primary leading-snug group-hover/title:text-accent-green transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p className="text-[14px] text-text-secondary leading-relaxed line-clamp-3 font-sans font-light">
            {plainTextExcerpt}
          </p>
        </div>

        {/* Author Metadata Footer */}
        <div className="flex items-center space-x-3 pt-6 mt-6 border-t border-border-light font-sans">
          {post.author?.avatar ? (
            <img 
              src={post.author.avatar.startsWith('/') ? `http://localhost:5000${post.author.avatar}` : post.author.avatar} 
              alt={post.author.name} 
              className="w-8 h-8 rounded-full object-cover border border-border-light"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent-green text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
              {post.author?.name ? post.author.name.charAt(0) : 'U'}
            </div>
          )}
          <div className="truncate">
            <Link to={`/author/${post.author?.username}`} className="text-xs font-bold text-text-primary hover:text-accent-green transition-colors block truncate">
              {post.author?.name}
            </Link>
            <span className="text-[10px] text-text-secondary block font-medium">
              {formatAbsoluteDate(post.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;

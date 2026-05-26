import React from 'react';
import { Link } from 'react-router-dom';
import { calculateReadTime } from '../utils/readTime';
import { formatAbsoluteDate } from '../utils/formatDate';

export const PostCard = ({ post }) => {
  // Strip HTML tags for clean text preview
  const plainExcerpt = post.body
    ? post.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  const readTime = calculateReadTime(post.body);
  const commentCount = post.commentCount !== undefined ? post.commentCount : 0; // or loaded elsewhere

  return (
    <article className="border-t border-[#111111]/15 py-10 first:border-t-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left column: Title & Excerpt (takes 2 cols on md screens) */}
        <div className="md:col-span-2 space-y-3">
          <Link to={`/post/${post.slug}`} className="group block">
            <h2 className="text-2xl md:text-[23px] font-semibold text-[#111111] leading-tight font-serif hover:text-[#5B4FE8] transition-colors duration-150">
              {post.title}
            </h2>
          </Link>
          
          <p className="text-[15px] text-[#666666] leading-relaxed line-clamp-2 font-sans font-light">
            {plainExcerpt}
          </p>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags && post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/tag/${tag}`}
                className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 border border-[#111111]/30 text-[#111111] hover:border-[#5B4FE8] hover:text-[#5B4FE8] transition-all duration-150 rounded-[4px]"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Right column: Author info, date & metadata stacked on desktop */}
        <div className="md:col-span-1 flex md:flex-col justify-between items-start md:items-end h-full text-xs text-[#666666] pt-1 md:pt-0 font-sans border-t border-dashed border-[#111111]/10 md:border-t-0 mt-3 md:mt-0 pt-3 md:pt-0">
          {/* Author */}
          <div className="flex items-center space-x-2 md:mb-3">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar.startsWith('/') ? `http://localhost:5000${post.author.avatar}` : post.author.avatar}
                alt={post.author.name}
                className="w-6 h-6 rounded-full object-cover border border-[#111111]/20"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-[10px] font-bold">
                {post.author?.name ? post.author.name.charAt(0) : 'U'}
              </div>
            )}
            <Link to={`/author/${post.author?.username}`} className="font-medium text-[#111111] hover:text-[#5B4FE8] transition-colors">
              {post.author?.name}
            </Link>
          </div>

          {/* Date, Read-time & Comments count */}
          <div className="flex flex-col items-start md:items-end space-y-1">
            <span className="font-light">{formatAbsoluteDate(post.createdAt)}</span>
            <div className="flex items-center space-x-2 font-light">
              <span>{readTime}</span>
              <span>•</span>
              <Link to={`/post/${post.slug}#comments`} className="hover:text-[#5B4FE8] transition-colors">
                {post.likes ? post.likes.length : 0} {post.likes?.length === 1 ? 'like' : 'likes'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;

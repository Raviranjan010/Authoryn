import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import { calculateReadTime } from '../utils/readTime';
import { formatAbsoluteDate } from '../utils/formatDate';
import LikeButton from '../components/LikeButton';
import AuthorCard from '../components/AuthorCard';
import CommentSection from '../components/CommentSection';

export const PostDetail = () => {
  const { slug } = useParams();
  const { getPostBySlug, loading } = usePosts();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getPostBySlug(slug);
        setPost(data);
      } catch (err) {
        console.error(err);
        setError('The story you are looking for could not be found.');
      }
    };
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
        <div className="text-center font-sans font-light">
          <div className="w-6 h-6 border-t-2 border-r-2 border-[#111111] animate-spin mx-auto mb-4"></div>
          Reading story...
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5F0] px-6 font-sans">
        <h2 className="text-2xl font-semibold font-serif text-[#111111] mb-2">Story Not Found</h2>
        <p className="text-sm text-[#666666] font-light mb-6">{error || 'Could not load post.'}</p>
        <Link to="/" className="btn-outline text-xs px-4 py-2">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  const readTime = calculateReadTime(post.body);
  const coverUrl = post.coverImage
    ? (post.coverImage.startsWith('/') ? `http://localhost:5000${post.coverImage}` : post.coverImage)
    : 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=1200&q=80'; // fallback cover

  return (
    <article className="min-h-screen bg-[#F7F5F0] pb-24 font-sans">
      {/* Cover Image - full-width, 480px tall */}
      <div className="w-full h-[480px] overflow-hidden border-b border-[#111111]/15">
        <img
          src={coverUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-[720px] mx-auto px-6 mt-12 space-y-8">
        {/* Title - serif 42px */}
        <h1 className="text-4xl md:text-[42px] font-bold text-[#111111] leading-tight font-serif left-aligned">
          {post.title}
        </h1>

        {/* Meta Row: author avatar + name, date, read time, views, like button */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-[#111111]/10 text-xs text-[#666666]">
          <div className="flex items-center space-x-3">
            {/* Author Avatar & Name */}
            {post.author?.avatar ? (
              <img
                src={post.author.avatar.startsWith('/') ? `http://localhost:5000${post.author.avatar}` : post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover border border-[#111111]/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-xs font-bold uppercase">
                {post.author?.name ? post.author.name.charAt(0) : 'U'}
              </div>
            )}
            <div className="flex flex-col">
              <Link to={`/author/${post.author?.username}`} className="font-semibold text-[#111111] hover:text-[#5B4FE8] transition-colors">
                {post.author?.name}
              </Link>
              <span className="font-light">{formatAbsoluteDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Stats: Read Time, Views, Comments */}
          <div className="flex items-center space-x-4">
            <span className="font-light">{readTime}</span>
            <span className="font-light">{post.viewCount} {post.viewCount === 1 ? 'view' : 'views'}</span>
            <span className="font-light">{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            
            {/* Like Button */}
            <LikeButton postId={post._id} initialLikes={post.likes} />
          </div>
        </div>

        {/* Body Text: 19px, line-height 1.85, max-width 720px */}
        <div
          className="post-content-body text-[19px] leading-[1.85] text-[#111111] font-serif font-light space-y-6 break-words"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Tags shown at end of post body */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/tag/${tag}`}
                className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 border border-[#111111]/30 text-[#111111] hover:border-[#5B4FE8] hover:text-[#5B4FE8] transition-all duration-150 rounded-[4px]"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Author Card Section after body */}
        <AuthorCard author={post.author} />

        {/* Comment Section last */}
        <CommentSection postId={post._id} onCommentCountChange={setCommentCount} />
      </div>
    </article>
  );
};

export default PostDetail;

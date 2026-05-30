import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import { calculateReadTime } from '../utils/readTime';
import { formatAbsoluteDate } from '../utils/formatDate';
import LikeButton from '../components/LikeButton';
import AuthorCard from '../components/AuthorCard';
import CommentSection from '../components/CommentSection';
import { PostDetailSkeleton } from '../components/SkeletonLoader';
import { RiLeafLine } from 'react-icons/ri';
import { FiEye, FiMessageSquare, FiClock } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUrl';

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
      <div className="min-h-screen flex items-center justify-center bg-background font-sans">
        <PostDetailSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 font-sans text-center">
        <h2 className="text-2xl font-bold font-serif text-text-primary mb-2">Story Not Found</h2>
        <p className="text-sm text-text-secondary font-light mb-6">{error || 'Could not load post.'}</p>
        <Link to="/explore" className="btn-outline text-xs px-6 py-2.5 rounded-full font-bold">
          &larr; Back to Explore
        </Link>
      </div>
    );
  }

  const readTime = calculateReadTime(post.content);
  const coverUrl = post.thumbnail
    ? getImageUrl(post.thumbnail)
    : 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=1200&q=80';

  return (
    <article className="min-h-screen bg-background pb-24 font-sans text-left">
      
      {/* Cover Image - full-width, 480px tall */}
      <div className="w-full h-[320px] md:h-[480px] overflow-hidden border-b border-border-light relative bg-gray-900">
        <img
          src={coverUrl}
          alt={post.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-section/50 to-transparent"></div>
        
        {/* Floating Category Tag inside Banner */}
        {post.category && (
          <div className="absolute bottom-6 left-6 md:left-12">
            <span className="bg-accent-green text-white text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-md shadow-md">
              {post.category}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-[720px] mx-auto px-6 mt-12 space-y-8">
        {/* Title - serif 42px */}
        <h1 className="text-3xl md:text-[40px] font-bold text-text-primary leading-tight font-serif">
          {post.title}
        </h1>

        {/* Meta Row: author avatar + name, date, read time, views, like button */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-border-light text-xs text-text-secondary">
          <div className="flex items-center space-x-3">
            {/* Author Avatar & Name */}
            {post.author?.avatar ? (
              <img
                src={getImageUrl(post.author.avatar)}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover border border-border-light shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent-green text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                {post.author?.name ? post.author.name.charAt(0) : 'U'}
              </div>
            )}
            <div className="flex flex-col">
              <Link to={`/author/${post.author?.username}`} className="font-bold text-text-primary hover:text-accent-green transition-colors">
                {post.author?.name}
              </Link>
              <span className="font-light">{formatAbsoluteDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Stats: Read Time, Views, Comments */}
          <div className="flex items-center space-x-4">
            <span className="font-light flex items-center space-x-1" title="Reading Time">
              <FiClock />
              <span>{readTime}</span>
            </span>
            <span className="font-light flex items-center space-x-1" title="Views">
              <FiEye />
              <span>{post.viewCount} {post.viewCount === 1 ? 'view' : 'views'}</span>
            </span>
            <span className="font-light flex items-center space-x-1" title="Comments">
              <FiMessageSquare />
              <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </span>
            
            {/* Like Button */}
            <LikeButton postId={post._id} initialLikes={post.likes} />
          </div>
        </div>

        {/* Body Text: 19px, line-height 1.85, max-width 720px */}
        <div
          className="post-content-body text-[17px] md:text-[18px] leading-[1.85] text-text-primary font-serif font-light space-y-6 break-words"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags shown at end of post body */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/explore?search=${tag}`}
                className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 border border-border-light text-text-secondary hover:border-accent-green hover:text-accent-green transition-all rounded-md"
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

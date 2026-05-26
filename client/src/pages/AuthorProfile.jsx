import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import usePosts from '../hooks/usePosts';
import useAuth from '../hooks/useAuth';
import BlogCard from '../components/BlogCard';
import { BlogGridSkeleton } from '../components/SkeletonLoader';
import { FiArrowLeft, FiEdit3, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const AuthorProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { getUserPosts, loading: postsLoading } = usePosts();

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfileAndPosts = async () => {
      setProfileLoading(true);
      setError('');
      try {
        // Fetch user public profile
        const userRes = await api.get(`/api/users/${username}`);
        if (userRes.data.success) {
          setAuthor(userRes.data.user);
        }

        // Fetch author's posts (will include drafts if owner)
        const postsData = await getUserPosts(username);
        setPosts(postsData);
      } catch (err) {
        console.error(err);
        setError('Could not retrieve author profile. They may not exist.');
        toast.error('Failed to load profile details');
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfileAndPosts();
  }, [username]);

  if (profileLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-sans">
        <div className="text-center font-light">
          <div className="w-8 h-8 border-4 border-soft-accent border-t-accent-green rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-xs text-text-secondary font-semibold animate-pulse">Retrieving profile...</span>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 font-sans text-center">
        <h2 className="text-2xl font-bold font-serif text-text-primary mb-2">Author Not Found</h2>
        <p className="text-sm text-text-secondary font-light mb-6">{error || 'Could not load profile details.'}</p>
        <Link to="/" className="btn-outline text-xs px-6 py-2.5 rounded-full font-bold">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === author.username;
  const publishedPosts = posts.filter(p => p.status === 'published');
  const draftPosts = posts.filter(p => p.status === 'draft');

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 px-6 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-10 text-left">
        
        {/* Author Bio Header Card */}
        <header className="bg-white border border-border-light rounded-2xl p-8 shadow-premium flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          {author.avatar ? (
            <img
              src={author.avatar.startsWith('/') ? `http://localhost:5000${author.avatar}` : author.avatar}
              alt={author.name}
              className="w-24 h-24 rounded-full object-cover border border-border-light shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-accent-green text-white flex items-center justify-center text-4xl font-bold uppercase shadow-sm">
              {author.name.charAt(0)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold font-serif text-text-primary leading-tight">
                {author.name}
              </h1>
              <p className="text-xs text-text-secondary font-mono">@{author.username}</p>
            </div>
            
            <p className="text-[14px] leading-relaxed text-text-secondary font-light max-w-2xl">
              {author.bio || 'This writer has not added a biography yet.'}
            </p>

            <div className="flex items-center space-x-4 pt-1 text-xs font-semibold text-text-secondary">
              <span className="flex items-center space-x-1">
                <FiFileText className="text-accent-green" />
                <span>{publishedPosts.length} Published Articles</span>
              </span>
              {isOwnProfile && draftPosts.length > 0 && (
                <span className="text-amber-600 font-bold bg-amber-500/5 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {draftPosts.length} Drafts
                </span>
              )}
            </div>

            {isOwnProfile && (
              <div className="pt-3">
                <Link to="/settings" className="btn-outline flex items-center space-x-1.5 text-xs px-4 py-2 font-bold max-w-[160px] cursor-pointer">
                  <FiEdit3 />
                  <span>Edit Profile</span>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Author Posts List */}
        <main className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 border-b border-border-light pb-2 font-mono">
            Written Articles ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="bg-white border border-border-light rounded-xl p-12 text-center text-sm text-text-secondary font-light shadow-sm">
              This author has not written any stories yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <div key={post._id} className="relative h-full">
                  {post.status === 'draft' && (
                    <span className="absolute top-4 right-4 bg-amber-500/90 text-white text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md backdrop-blur-sm z-10 shadow-sm">
                      Draft
                    </span>
                  )}
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuthorProfile;

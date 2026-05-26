import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import usePosts from '../hooks/usePosts';
import useAuth from '../hooks/useAuth';
import PostCard from '../components/PostCard';

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
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfileAndPosts();
  }, [username]);

  if (profileLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
        <div className="text-center font-sans font-light">
          <div className="w-6 h-6 border-t-2 border-r-2 border-[#111111] animate-spin mx-auto mb-4"></div>
          Retrieving profile...
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5F0] px-6 font-sans">
        <h2 className="text-2xl font-semibold font-serif text-[#111111] mb-2">Author Not Found</h2>
        <p className="text-sm text-[#666666] font-light mb-6">{error || 'Could not load profile details.'}</p>
        <Link to="/" className="btn-outline text-xs px-4 py-2">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === author.username;

  return (
    <div className="min-h-screen bg-[#F7F5F0] pt-24 pb-20 px-6 font-sans">
      <div className="max-w-[720px] mx-auto space-y-12">
        {/* Author Bio Header Card */}
        <header className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6 pb-10 border-b border-[#111111]/15">
          {/* Avatar */}
          {author.avatar ? (
            <img
              src={author.avatar.startsWith('/') ? `http://localhost:5000${author.avatar}` : author.avatar}
              alt={author.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#111111]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-3xl font-bold uppercase">
              {author.name.charAt(0)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-3">
              <h1 className="text-3xl font-bold font-serif text-[#111111]">
                {author.name}
              </h1>
              <span className="text-xs text-[#666666] font-mono">@{author.username}</span>
            </div>
            <p className="text-[15px] leading-relaxed text-[#666666] font-light">
              {author.bio || 'This writer has not added a biography yet.'}
            </p>
            {isOwnProfile && (
              <div className="pt-2">
                <Link to="/settings" className="btn-outline text-xs px-3.5 py-1.5 inline-block">
                  Edit Profile Settings
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Author Posts List */}
        <main className="space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#666666] mb-4">
            Published Articles ({posts.filter(p => p.status === 'published').length})
            {isOwnProfile && posts.some(p => p.status === 'draft') && ` + Drafts (${posts.filter(p => p.status === 'draft').length})`}
          </h2>

          <div className="space-y-1">
            {posts.length === 0 ? (
              <p className="text-sm text-[#666666] italic font-light py-10 text-center">
                This author has not written any stories yet.
              </p>
            ) : (
              posts.map((post) => {
                const isDraft = post.status === 'draft';
                return (
                  <div key={post._id} className="relative">
                    {isDraft && (
                      <span className="absolute top-10 right-0 bg-amber-500/10 text-amber-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border border-amber-600/30 rounded-[4px] z-10">
                        Draft
                      </span>
                    )}
                    <PostCard post={post} />
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthorProfile;

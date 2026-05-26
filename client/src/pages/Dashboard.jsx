import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePosts from '../hooks/usePosts';
import { formatAbsoluteDate } from '../utils/formatDate';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { getUserPosts, deletePost, loading } = usePosts();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalViews: 0, totalLikes: 0 });
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // for sidebar layout

  const loadPosts = async () => {
    if (!user) return;
    try {
      const postsData = await getUserPosts(user.username);
      setPosts(postsData);

      // Compute stats
      const totalPosts = postsData.length;
      const totalViews = postsData.reduce((acc, p) => acc + (p.viewCount || 0), 0);
      const totalLikes = postsData.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
      setStats({ totalPosts, totalViews, totalLikes });
    } catch (err) {
      console.error('Failed to load dashboard posts:', err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [user]);

  const handleDeleteClick = (postId) => {
    setDeletingId(postId);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const handleConfirmDelete = async (postId) => {
    try {
      await deletePost(postId);
      setDeletingId(null);
      // Reload posts
      loadPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] pt-24 pb-20 px-6 font-sans">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Sidebar Left */}
          <aside className="md:col-span-1 border border-[#111111]/15 rounded-[4px] p-6 space-y-6 bg-transparent">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider font-mono">Control Panel</h2>
              <p className="text-xs text-[#666666] font-light">Managing @{user?.username}</p>
            </div>
            
            <nav className="flex flex-col space-y-2 text-sm">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-[4px] font-medium transition-colors bg-[#111111] text-[#F7F5F0]"
              >
                My Posts
              </Link>
              <Link
                to="/write"
                className="px-3 py-2 rounded-[4px] font-medium text-[#111111] hover:bg-[#111111]/5 transition-colors"
              >
                Write New Post
              </Link>
              <Link
                to="/settings"
                className="px-3 py-2 rounded-[4px] font-medium text-[#111111] hover:bg-[#111111]/5 transition-colors"
              >
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-[4px] font-medium text-red-600 hover:bg-red-600/5 transition-colors text-left cursor-pointer"
              >
                Log Out
              </button>
            </nav>
          </aside>

          {/* Main Area Col 2-4 */}
          <main className="md:col-span-3 space-y-8">
            
            {/* Page Title */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold font-serif text-[#111111]">Dashboard</h1>
              <p className="text-sm text-[#666666] font-light">Monitor your publication metrics and write new content.</p>
            </div>

            {/* Stat cards row on top */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Card 1: Total Posts */}
              <div className="border border-[#111111]/15 rounded-[4px] p-5 space-y-2 bg-transparent">
                <span className="text-[10px] font-semibold text-[#666666] uppercase tracking-widest font-mono">Total Posts</span>
                <p className="text-3xl font-bold font-serif text-[#111111]">{stats.totalPosts}</p>
              </div>

              {/* Card 2: Total Views */}
              <div className="border border-[#111111]/15 rounded-[4px] p-5 space-y-2 bg-transparent">
                <span className="text-[10px] font-semibold text-[#666666] uppercase tracking-widest font-mono">Total Views</span>
                <p className="text-3xl font-bold font-serif text-[#111111]">{stats.totalViews}</p>
              </div>

              {/* Card 3: Total Likes */}
              <div className="border border-[#111111]/15 rounded-[4px] p-5 space-y-2 bg-transparent">
                <span className="text-[10px] font-semibold text-[#666666] uppercase tracking-widest font-mono">Total Likes</span>
                <p className="text-3xl font-bold font-serif text-[#111111]">{stats.totalLikes}</p>
              </div>
            </div>

            {/* Posts Table */}
            <div className="border border-[#111111]/15 rounded-[4px] overflow-hidden bg-transparent">
              <div className="p-5 border-b border-[#111111]/15">
                <h3 className="font-semibold text-sm text-[#111111] uppercase tracking-wider font-mono">Your Stories</h3>
              </div>
              
              {loading && posts.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#666666] font-light">
                  <div className="w-5 h-5 border-t-2 border-r-2 border-[#111111] animate-spin mx-auto mb-3"></div>
                  Fetching data...
                </div>
              ) : posts.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#666666] italic font-light">
                  You haven't written any stories yet.{' '}
                  <Link to="/write" className="text-[#5B4FE8] font-semibold hover:underline">
                    Write your first post
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#111111]/5 border-b border-[#111111]/15 text-xs text-[#666666] uppercase font-semibold font-mono">
                        <th className="p-4">Title</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Views</th>
                        <th className="p-4 text-center">Likes</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#111111]/10">
                      {posts.map((post) => {
                        const isDraft = post.status === 'draft';
                        const isConfirming = deletingId === post._id;
                        
                        return (
                          <tr key={post._id} className="hover:bg-[#111111]/5 transition-colors">
                            {/* Title */}
                            <td className="p-4 max-w-xs md:max-w-sm truncate">
                              <Link
                                to={post.status === 'published' ? `/post/${post.slug}` : `/edit/${post._id}`}
                                className="font-medium text-[#111111] hover:text-[#5B4FE8] transition-colors"
                              >
                                {post.title}
                              </Link>
                            </td>

                            {/* Status Badge */}
                            <td className="p-4">
                              {isDraft ? (
                                <span className="inline-flex items-center text-[10px] font-semibold text-amber-600 border border-amber-600/35 bg-amber-500/5 px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                                  Draft
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-semibold text-green-700 border border-green-700/35 bg-green-700/5 px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                                  Published
                                </span>
                              )}
                            </td>

                            {/* Views */}
                            <td className="p-4 text-center font-light text-xs">{post.viewCount || 0}</td>

                            {/* Likes */}
                            <td className="p-4 text-center font-light text-xs">{post.likes?.length || 0}</td>

                            {/* Date */}
                            <td className="p-4 font-light text-xs whitespace-nowrap">{formatAbsoluteDate(post.createdAt)}</td>

                            {/* Actions with Custom Inline Confirmation */}
                            <td className="p-4 text-right whitespace-nowrap">
                              {isConfirming ? (
                                <div className="flex items-center justify-end space-x-2">
                                  <span className="text-xs text-red-600 font-semibold uppercase tracking-wider mr-1">Confirm?</span>
                                  <button
                                    onClick={() => handleConfirmDelete(post._id)}
                                    className="px-2 py-0.5 text-xs font-semibold bg-red-600 text-[#F7F5F0] rounded-[3px] uppercase tracking-wider cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={handleCancelDelete}
                                    className="px-2 py-0.5 text-xs font-semibold border border-[#111111]/30 text-[#111111] rounded-[3px] uppercase tracking-wider cursor-pointer hover:bg-[#111111] hover:text-[#F7F5F0]"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end space-x-3 text-xs">
                                  <Link
                                    to={`/edit/${post._id}`}
                                    className="font-semibold text-[#111111] hover:text-[#5B4FE8] uppercase tracking-wider transition-colors"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteClick(post._id)}
                                    className="font-semibold text-red-600 hover:text-red-800 uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

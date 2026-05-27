import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import usePosts from '../hooks/usePosts';
import api from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { formatAbsoluteDate, formatRelativeTime } from '../utils/formatDate';
import { FiEdit2, FiTrash2, FiFileText, FiEye, FiHeart, FiPlus, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useAuth();
  const { getUserPosts, deletePost, loading: postsLoading } = usePosts();
  const navigate = useNavigate();

  // Dashboard Data States
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  
  // Dashboard Filtering
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Stats
  const [stats, setStats] = useState({ totalPosts: 0, totalViews: 0, totalLikes: 0 });
  const [deletingId, setDeletingId] = useState(null);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      // 1. Fetch user posts
      const postsData = await getUserPosts(user.username);
      setPosts(postsData);
      setFilteredPosts(postsData);

      // Compute stats
      const totalPosts = postsData.length;
      const totalViews = postsData.reduce((acc, p) => acc + (p.viewCount || 0), 0);
      const totalLikes = postsData.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
      setStats({ totalPosts, totalViews, totalLikes });

      // 2. Fetch recent comments
      const commResponse = await api.get('/api/comments');
      if (commResponse.data.success) {
        setComments(commResponse.data.comments);
      }
    } catch (err) {
      console.error('Failed to load dashboard posts:', err);
      toast.error('Error fetching dashboard details');
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Apply frontend search and category/status filtering
  useEffect(() => {
    let result = [...posts];

    // Search filter
    if (search.trim()) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }


    setFilteredPosts(result);
  }, [search, statusFilter, posts]);

  const handleConfirmDelete = async (postId) => {
    try {
      await deletePost(postId);
      setDeletingId(null);
      toast.success('Story deleted successfully');
      loadDashboardData();
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete story');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 px-6 font-sans">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar (takes 3 cols on desktop) */}
          <div className="lg:col-span-3">
            <Sidebar />
          </div>

          {/* Right Main Content (takes 9 cols on desktop) */}
          <main className="lg:col-span-9 space-y-8 text-left">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold font-serif text-text-primary">Writer Workspace</h1>
                <p className="text-sm text-text-secondary font-light">Monitor publication performance metrics and manage drafts.</p>
              </div>
              <Link 
                to="/write" 
                className="btn-primary flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold shadow-sm"
              >
                <FiPlus className="text-base" />
                <span>Create Story</span>
              </Link>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Stat 1: Total Posts */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="border border-border-light rounded-xl p-6 bg-white shadow-premium flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono">Total Stories</span>
                  <p className="text-3xl font-bold font-serif text-text-primary">{stats.totalPosts}</p>
                </div>
                <div className="w-10 h-10 bg-soft-accent/40 text-accent-green rounded-full flex items-center justify-center text-lg">
                  <FiFileText />
                </div>
              </motion.div>

              {/* Stat 2: Total Views */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="border border-border-light rounded-xl p-6 bg-white shadow-premium flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono">Total Views</span>
                  <p className="text-3xl font-bold font-serif text-text-primary">{stats.totalViews}</p>
                </div>
                <div className="w-10 h-10 bg-soft-accent/40 text-accent-green rounded-full flex items-center justify-center text-lg">
                  <FiEye />
                </div>
              </motion.div>

              {/* Stat 3: Total Likes */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="border border-border-light rounded-xl p-6 bg-white shadow-premium flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono">Total Likes</span>
                  <p className="text-3xl font-bold font-serif text-text-primary">{stats.totalLikes}</p>
                </div>
                <div className="w-10 h-10 bg-soft-accent/40 text-accent-green rounded-full flex items-center justify-center text-lg">
                  <FiHeart />
                </div>
              </motion.div>
            </div>

            {/* Grid for CRUD Table and Comments section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* CRUD Table container (takes 8 cols) */}
              <div className="xl:col-span-8 bg-white border border-border-light rounded-xl shadow-premium overflow-hidden">
                {/* Search and Filters Header */}
                <div className="p-5 border-b border-border-light flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white">
                  <h3 className="font-bold text-base font-serif text-text-primary">Stories Dashboard</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <input 
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Filter title..."
                      className="px-3.5 py-1.5 bg-background border border-border-light rounded-full text-xs font-semibold focus:outline-none focus:border-accent-green"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white border border-border-light rounded-full px-3 py-1.5 text-[11px] font-bold focus:outline-none cursor-pointer focus:border-accent-green"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Drafts</option>
                    </select>
                  </div>
                </div>

                {postsLoading && posts.length === 0 ? (
                  <div className="py-24 text-center">
                    <div className="w-8 h-8 border-4 border-soft-accent border-t-accent-green rounded-full animate-spin mx-auto mb-3"></div>
                    <span className="text-xs text-text-secondary font-semibold animate-pulse">Loading articles...</span>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="py-20 text-center text-sm text-text-secondary font-light">
                    {posts.length === 0 ? (
                      <p>
                        You haven't written any articles yet.{' '}
                        <Link to="/write" className="text-accent-green font-bold hover:underline">
                          Create your first story
                        </Link>
                      </p>
                    ) : (
                      <p>No articles match your filters.</p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-background border-b border-border-light text-[10px] text-text-secondary uppercase font-bold tracking-wider font-mono">
                          <th className="p-4">Title</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Metrics</th>
                          <th className="p-4">Created Date</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light/60 text-[13px] text-text-primary">
                        {filteredPosts.map((post) => {
                          const isDraft = post.status === 'draft';
                          const isConfirming = deletingId === post._id;
                          
                          return (
                            <tr key={post._id} className="hover:bg-background/40 transition-colors">
                              {/* Title */}
                              <td className="p-4 max-w-xs truncate">
                                <Link
                                  to={post.status === 'published' ? `/post/${post.slug}` : `/edit/${post._id}`}
                                  className="font-semibold text-text-primary hover:text-accent-green transition-colors"
                                >
                                  {post.title}
                                </Link>
                              </td>

                              {/* Category */}
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-background rounded-md border border-border-light text-[10px] font-bold text-text-secondary">
                                  {post.category || 'General'}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="p-4">
                                {isDraft ? (
                                  <span className="inline-flex items-center text-[9px] font-bold text-amber-700 border border-amber-500/25 bg-amber-500/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Draft
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[9px] font-bold text-accent-green border border-accent-green/25 bg-accent-green/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Published
                                  </span>
                                )}
                              </td>

                              {/* Metrics (Views / Likes) */}
                              <td className="p-4 text-center font-mono text-[11px] text-text-secondary whitespace-nowrap">
                                <span className="inline-flex items-center space-x-1 mr-2" title="Views">
                                  <FiEye />
                                  <span>{post.viewCount || 0}</span>
                                </span>
                                <span className="inline-flex items-center space-x-1" title="Likes">
                                  <FiHeart />
                                  <span>{post.likes ? post.likes.length : 0}</span>
                                </span>
                              </td>

                              {/* Date */}
                              <td className="p-4 text-text-secondary text-xs whitespace-nowrap">
                                {formatAbsoluteDate(post.createdAt)}
                              </td>
                              {/* <td></td> */}

                              {/* Actions */}
                              <td className="p-4 text-right whitespace-nowrap">
                                {isConfirming ? (
                                  <div className="flex items-center justify-end space-x-2">
                                    <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Sure?</span>
                                    <button
                                      onClick={() => handleConfirmDelete(post._id)}
                                      className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded cursor-pointer"
                                    >
                                      Yes!
                                    </button>
                                    <button
                                      onClick={() => setDeletingId(null)}
                                      className="px-2 py-0.5 text-[10px] font-bold border border-border-light text-text-primary bg-white rounded cursor-pointer hover:bg-background"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end space-x-3 text-xs">
                                    <Link
                                      to={`/edit/${post._id}`}
                                      className="font-bold text-text-primary hover:text-accent-green uppercase tracking-wider transition-colors flex items-center space-x-1"
                                      title="Edit story"
                                    >
                                      <FiEdit2 className="text-xs" />
                                      <span className="hidden sm:inline">Edit</span>
                                    </Link>
                                    <button
                                      onClick={() => setDeletingId(post._id)}
                                      className="font-bold text-red-600 hover:text-red-800 uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1"
                                      title="Delete story"
                                    >
                                      <FiTrash2 className="text-xs" />
                                      <span className="hidden sm:inline">Delete</span>
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

              {/* Recent Comments Stream (takes 4 cols) */}
              <div className="xl:col-span-4 bg-white border border-border-light rounded-xl p-5 shadow-premium space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-border-light">
                  <h3 className="font-bold text-base font-serif text-text-primary flex items-center space-x-2">
                    <FiMessageSquare className="text-accent-green" />
                    <span>Recent Activity</span>
                  </h3>
                </div>

                {commentsLoading ? (
                  <div className="py-8 text-center text-xs text-text-secondary animate-pulse font-semibold">
                    Fetching comments...
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-text-secondary italic font-light text-center py-6">
                    No recent comment activity on the platform.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="text-xs border-b border-border-light/40 last:border-0 pb-3 last:pb-0 space-y-1 bg-background/20 p-2.5 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-text-primary">{comment.user?.name}</span>
                          <span className="text-[9px] text-text-secondary font-mono">{formatRelativeTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-text-secondary leading-relaxed font-light italic line-clamp-2">
                          "{comment.text}"
                        </p>
                        {comment.post && (
                          <div className="pt-1 text-[9px] font-semibold text-accent-green truncate">
                            on: <Link to={`/post/${comment.post.slug}`} className="hover:underline text-accent-green">{comment.post.title}</Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

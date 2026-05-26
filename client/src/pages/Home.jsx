import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import useAuth from '../hooks/useAuth';
import useDebounce from '../hooks/useDebounce';
import api from '../api/axiosInstance';
import slugify from '../utils/slugify';
import { formatAbsoluteDate, formatRelativeTime } from '../utils/formatDate';
import { calculateReadTime } from '../utils/readTime';

export const Home = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const { getPosts, createPost, loading: postsLoading } = usePosts();

  // Feed State
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedTag, setSelectedTag] = useState('');
  
  // Custom Widgets State
  const [recentComments, setRecentComments] = useState([]);
  const [widgetStats, setWidgetStats] = useState({ posts: 24, views: 12.4, likes: 2.1, comments: 320 });
  const [newCommentBody, setNewCommentBody] = useState('');
  
  // Quick Write State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTags, setQuickTags] = useState(['Developer Experience', 'Productivity', 'Tech']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [quickWriteLoading, setQuickWriteLoading] = useState(false);
  
  // Navigation & Dropdown State
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);
  
  // Debounce search input by 400ms
  const debouncedSearch = useDebounce(search, 400);

  // Fetch feed posts
  const loadFeedPosts = async () => {
    try {
      const params = {
        limit: 10,
        sort,
        search: debouncedSearch,
        tag: selectedTag
      };
      const response = await getPosts(params);
      if (response.success) {
        setPosts(response.posts);
      }
    } catch (err) {
      console.error('Error loading posts for feed:', err);
    }
  };

  // Fetch recent comments for widget
  const loadRecentComments = async () => {
    try {
      const res = await api.get('/api/comments');
      if (res.data.success) {
        setRecentComments(res.data.comments);
      }
    } catch (err) {
      console.error('Error loading recent comments:', err);
    }
  };

  // Fetch dashboard stats dynamically if logged in
  const loadUserStats = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/api/posts/user/${user.username}`);
      if (res.data.success) {
        const userPosts = res.data.posts;
        const totalPosts = userPosts.length;
        const totalViews = userPosts.reduce((acc, p) => acc + (p.viewCount || 0), 0);
        const totalLikes = userPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
        
        // Render view/likes in clean 'K' format if large
        const formattedViews = totalViews > 1000 ? (totalViews / 1000).toFixed(1) : totalViews;
        const formattedLikes = totalLikes > 1000 ? (totalLikes / 1000).toFixed(1) : totalLikes;
        
        // Try getting comments count on their posts
        let totalComments = 0;
        for (const post of userPosts) {
          try {
            const commentsRes = await api.get(`/api/comments/${post._id}`);
            if (commentsRes.data.success) {
              totalComments += commentsRes.data.comments.length;
            }
          } catch (cErr) {
            // ignore
          }
        }
        
        setWidgetStats({
          posts: totalPosts,
          views: formattedViews,
          likes: formattedLikes,
          comments: totalComments
        });
      }
    } catch (err) {
      console.error('Error loading user stats:', err);
    }
  };

  useEffect(() => {
    loadFeedPosts();
  }, [debouncedSearch, sort, selectedTag]);

  useEffect(() => {
    loadRecentComments();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserStats();
    } else {
      // Default mock state for logged out
      setWidgetStats({ posts: 24, views: '12.4K', likes: '2.1K', comments: 320 });
    }
  }, [user]);

  // Explore Demo - Auto Login Guest Admin account
  const handleExploreDemo = async () => {
    setDemoLoginLoading(true);
    try {
      await login('admin@authoryn.com', 'password123', false);
      setUserDropdownOpen(false);
    } catch (err) {
      console.error('Demo Login failed:', err);
      alert('Demo credentials not found. Make sure you ran database seeding: npm run seed');
    } finally {
      setDemoLoginLoading(false);
    }
  };

  // Quick Draft Post Submission
  const handleQuickWriteSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!quickTitle.trim()) return;

    setQuickWriteLoading(true);
    const formData = new FormData();
    formData.append('title', quickTitle.trim());
    formData.append('body', '<p>Start writing your story here...</p>');
    formData.append('tags', quickTags.join(', '));
    formData.append('status', 'draft');

    try {
      const createdPost = await createPost(formData);
      if (createdPost) {
        navigate(`/edit/${createdPost._id}`);
      }
    } catch (err) {
      console.error('Failed to create quick draft:', err);
    } finally {
      setQuickWriteLoading(false);
    }
  };

  // Quick Comment Submission (posts on the featured article or the first article in feed)
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newCommentBody.trim() || posts.length === 0) return;

    const targetPost = posts[0]; // Post comment on featured post
    const prevComments = [...recentComments];

    // Optimistic Update
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      body: newCommentBody.trim(),
      createdAt: new Date().toISOString(),
      author: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      },
      post: {
        title: targetPost.title,
        slug: targetPost.slug
      }
    };

    setRecentComments([optimisticComment, ...recentComments]);
    const currentBody = newCommentBody;
    setNewCommentBody('');

    try {
      const res = await api.post(`/api/comments/${targetPost._id}`, { body: currentBody });
      if (res.data.success) {
        // Swap temp with actual
        setRecentComments((prev) =>
          prev.map((c) => (c._id === optimisticComment._id ? { ...res.data.comment, post: { title: targetPost.title, slug: targetPost.slug } } : c))
        );
      }
    } catch (err) {
      console.error('Failed to post quick comment:', err);
      setRecentComments(prevComments);
      setNewCommentBody(currentBody);
    }
  };

  // Add Tag in Quick Write
  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTagInput.trim() && !quickTags.includes(newTagInput.trim())) {
      setQuickTags([...quickTags, newTagInput.trim()]);
      setNewTagInput('');
      setShowAddTag(false);
    }
  };

  // Remove Tag in Quick Write
  const handleRemoveTag = (tagToRemove) => {
    setQuickTags(quickTags.filter((t) => t !== tagToRemove));
  };

  // Map variables
  const featuredPost = posts[0];
  const latestFeedPosts = posts.slice(1, 4);

  return (
    <div className="min-h-screen bg-[#F7F5F0] pt-20 pb-0 px-0 font-sans text-[#111111] overflow-x-hidden">
      
      {/* 3-COLUMN LAYOUT GRID */}
      <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: BRANDING & FEATURES (lg:col-span-3) */}
        <aside className="lg:col-span-3 space-y-8 pr-0 lg:pr-4 border-b lg:border-b-0 lg:border-r border-[#111111]/10 pb-8 lg:pb-0">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight font-sans">Authoryn</span>
            <span className="text-[#5B4FE8] text-xl font-bold">✦</span>
          </div>

          {/* Heading Pitch */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-[45px] font-bold leading-none tracking-tight font-serif text-[#111111]">
              Writing that <br />
              defies <span className="brush-underline">gravity.</span>
            </h1>
            <p className="text-[13px] leading-relaxed text-[#666666] font-light max-w-xs font-sans">
              Authoryn is a MERN stack blogging platform for bold ideas, deep insights, and timeless stories. Write. Share. Inspire.
            </p>
          </div>

          {/* Features Checklists */}
          <div className="space-y-5 pt-4">
            {/* Feature 1 */}
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-[#5B4FE8]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Write & Publish</h4>
                <p className="text-[11px] text-[#666666] font-light leading-snug">Rich editor, image uploads, tags, drafts & publishing.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-[#5B4FE8]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Engage Readers</h4>
                <p className="text-[11px] text-[#666666] font-light leading-snug">Likes, comments & optimistic UI for instant feedback.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-[#5B4FE8]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Discover Stories</h4>
                <p className="text-[11px] text-[#666666] font-light leading-snug">Search, sort, and filter by tags, views, or newest.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-[#5B4FE8]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Track Performance</h4>
                <p className="text-[11px] text-[#666666] font-light leading-snug">Real-time metrics dashboard with key analytic counters.</p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-[#5B4FE8]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Secure & Reliable</h4>
                <p className="text-[11px] text-[#666666] font-light leading-snug">JWT auth, remember me, debounced views & more.</p>
              </div>
            </div>
          </div>

          {/* Tech Logos */}
          <div className="flex items-center space-x-3 pt-6 border-t border-[#111111]/10 text-xs font-mono font-medium text-[#666666]">
            {/* React Icon */}
            <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-5 h-5 text-cyan-500 fill-current">
              <circle cx="0" cy="0" r="2.05"/>
              <g stroke="currentColor" strokeWidth="1" fill="none">
                <ellipse rx="11" ry="4.2"/>
                <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
                <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
              </g>
            </svg>
            {/* Node Icon */}
            <span className="text-[#339933] font-bold font-sans">node<span className="text-xs font-light font-mono text-[#666666]">.js</span></span>
            <span>•</span>
            <span className="font-sans font-bold text-[#111111]">express</span>
            <span>•</span>
            {/* MongoDB Leaf */}
            <span className="text-[#47A248] font-bold font-sans flex items-center">
              mongo<span className="text-xs font-mono text-[#666666] font-normal">DB</span>
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col space-y-2 pt-4">
            <button
              onClick={handleExploreDemo}
              disabled={demoLoginLoading}
              className="btn-accent py-2.5 text-xs text-center uppercase tracking-wider font-semibold w-full flex justify-center items-center"
            >
              {demoLoginLoading ? (
                <div className="w-4 h-4 border-t-2 border-r-2 border-transparent rounded-full animate-spin"></div>
              ) : (
                'Explore Demo ➔'
              )}
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="btn-outline py-2.5 text-xs text-center uppercase tracking-wider font-semibold w-full block"
            >
              View on GitHub
            </a>
          </div>
        </aside>

        {/* CENTER COLUMN: SEARCH, NAV, FEATURED, LATEST (lg:col-span-6) */}
        <main className="lg:col-span-6 space-y-8">
          
          {/* Header Row: Navigation tabs, search, write button, user avatar */}
          <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#111111]/10 font-sans">
            {/* Tabs */}
            <div className="flex space-x-6 text-xs uppercase tracking-wider font-bold text-[#666666]">
              <Link to="/" className="text-[#111111] hover:text-[#5B4FE8]">Home</Link>
              <a href="#branding" className="hover:text-[#5B4FE8]">About</a>
              <Link to="/tag/design" className="hover:text-[#5B4FE8]">Tags</Link>
              <Link to="/author/antigravity" className="hover:text-[#5B4FE8]">Authors</Link>
            </div>

            {/* Search, Write, Avatar */}
            <div className="flex items-center space-x-3 flex-1 sm:flex-initial justify-end">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-36 focus:w-48 transition-all duration-300 pl-8 pr-3 py-1 bg-transparent border border-[#111111]/20 focus:border-[#5B4FE8] rounded-[4px] text-xs placeholder-[#666666]/50 focus:outline-none"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 absolute left-2.5 top-1.5 text-[#666666]/60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </div>

              {/* Quick Write */}
              <Link
                to={user ? "/write" : "/login"}
                className="btn-accent px-3 py-1 text-xs font-semibold flex items-center space-x-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span>Write</span>
              </Link>

              {/* Avatar menu */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="w-7 h-7 rounded-full border border-[#111111]/30 overflow-hidden flex items-center justify-center cursor-pointer"
                  >
                    {user.avatar ? (
                      <img src={user.avatar.startsWith('/') ? `http://localhost:5000${user.avatar}` : user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-[10px] font-bold uppercase">{user.name.charAt(0)}</div>
                    )}
                  </button>
                ) : (
                  <Link to="/login" className="w-7 h-7 rounded-full bg-[#111111]/5 hover:bg-[#111111]/15 text-[#111111] flex items-center justify-center border border-[#111111]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 01-7.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {userDropdownOpen && user && (
                  <div className="absolute right-0 mt-2 w-40 bg-[#F7F5F0] border border-[#111111]/20 rounded-[4px] shadow-lg py-1 z-20 text-xs">
                    <div className="px-3 py-1.5 border-b border-[#111111]/10 font-bold text-[#111111]">@{user.username}</div>
                    <Link to="/dashboard" onClick={() => setUserDropdownOpen(false)} className="block px-3 py-2 text-[#111111] hover:bg-[#111111]/5">My Dashboard</Link>
                    <Link to="/settings" onClick={() => setUserDropdownOpen(false)} className="block px-3 py-2 text-[#111111] hover:bg-[#111111]/5">Profile Settings</Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-red-600 hover:bg-[#111111]/5"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* FEATURED STORY SECTION */}
          {postsLoading && posts.length === 0 ? (
            <div className="py-20 text-center font-sans font-light text-sm text-[#666666]">
              <div className="w-6 h-6 border-t-2 border-r-2 border-[#111111] animate-spin mx-auto mb-4"></div>
              Loading Featured Article...
            </div>
          ) : featuredPost ? (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left text */}
              <div className="space-y-4 pr-2">
                <span className="text-[10px] font-bold tracking-widest text-[#5B4FE8] uppercase block">Featured</span>
                <Link to={`/post/${featuredPost.slug}`}>
                  <h2 className="text-3xl font-bold font-serif text-[#111111] leading-tight hover:text-[#5B4FE8] transition-colors">
                    {featuredPost.title}
                  </h2>
                </Link>
                <p className="text-xs text-[#666666] leading-relaxed line-clamp-3 font-sans font-light">
                  {featuredPost.body ? featuredPost.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''}
                </p>

                {/* Author Info */}
                <div className="flex items-center space-x-3 pt-2">
                  {featuredPost.author?.avatar ? (
                    <img
                      src={featuredPost.author.avatar.startsWith('/') ? `http://localhost:5000${featuredPost.author.avatar}` : featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#111111]/20"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-xs font-bold uppercase">
                      {featuredPost.author?.name ? featuredPost.author.name.charAt(0) : 'U'}
                    </div>
                  )}
                  <div className="text-[10px] text-[#666666] font-sans">
                    <Link to={`/author/${featuredPost.author?.username}`} className="font-semibold text-[#111111] hover:underline block">
                      {featuredPost.author?.name}
                    </Link>
                    <span className="font-light">{formatAbsoluteDate(featuredPost.createdAt)} • {calculateReadTime(featuredPost.body)}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center space-x-4 pt-3 text-[11px] text-[#666666] font-mono">
                  <span className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{featuredPost.viewCount || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span>{featuredPost.likes?.length || 0}</span>
                  </span>
                </div>
              </div>

              {/* Right cover image */}
              <div className="w-full h-56 md:h-64 rounded-lg overflow-hidden border border-[#111111]/10">
                <img
                  src={featuredPost.coverImage ? (featuredPost.coverImage.startsWith('/') ? `http://localhost:5000${featuredPost.coverImage}` : featuredPost.coverImage) : 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=600&q=80'}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </section>
          ) : (
            <p className="text-center italic text-xs text-[#666666] py-10">No posts seeded yet.</p>
          )}

          {/* LATEST FEED SECTION */}
          <section className="space-y-6 pt-6 border-t border-[#111111]/10">
            {/* Header filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 font-sans">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111] font-mono">Latest from the feed</h3>
              
              <div className="flex items-center space-x-3 text-xs">
                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent border border-[#111111]/20 focus:border-[#5B4FE8] rounded-[4px] py-0.5 px-2 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="views">Views</option>
                  <option value="likes">Likes</option>
                </select>

                {/* Tag */}
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-transparent border border-[#111111]/20 focus:border-[#5B4FE8] rounded-[4px] py-0.5 px-2 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">All Tags</option>
                  <option value="technology">Technology</option>
                  <option value="design">Design</option>
                  <option value="culture">Culture</option>
                </select>
              </div>
            </div>

            {/* 3-Column Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {latestFeedPosts.length === 0 ? (
                <div className="col-span-3 text-center text-xs italic text-[#666666] py-12">No other posts in the feed.</div>
              ) : (
                latestFeedPosts.map((post) => {
                  const coverUrl = post.coverImage
                    ? (post.coverImage.startsWith('/') ? `http://localhost:5000${post.coverImage}` : post.coverImage)
                    : 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=400&q=80';
                  
                  // Category label from tags (or fallback)
                  const category = post.tags && post.tags.length > 0 ? post.tags[0] : 'general';

                  return (
                    <article key={post._id} className="bg-transparent border border-[#111111]/12 rounded-lg overflow-hidden flex flex-col justify-between h-full hover:shadow-md transition-all duration-200">
                      <div>
                        {/* Cover Photo */}
                        <div className="w-full h-32 overflow-hidden border-b border-[#111111]/10 bg-[#111111]/5">
                          <img src={coverUrl} alt={post.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Card Info */}
                        <div className="p-4 space-y-2">
                          <span className="category-label text-[#5B4FE8]">{category}</span>
                          <Link to={`/post/${post.slug}`}>
                            <h4 className="text-sm font-semibold font-serif leading-snug line-clamp-2 text-[#111111] hover:text-[#5B4FE8] transition-colors">
                              {post.title}
                            </h4>
                          </Link>
                          <p className="text-[11px] leading-relaxed text-[#666666] line-clamp-2 font-sans font-light">
                            {post.body ? post.body.replace(/<[^>]*>/g, ' ').trim() : ''}
                          </p>
                        </div>
                      </div>

                      {/* Footer Metrics */}
                      <div className="p-4 pt-0 border-t border-[#111111]/5 mt-3 flex justify-between items-center text-[10px] text-[#666666] font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center space-x-0.5">
                            <span>👁</span>
                            <span>{post.viewCount || 0}</span>
                          </span>
                          <span className="flex items-center space-x-0.5">
                            <span>♥</span>
                            <span>{post.likes?.length || 0}</span>
                          </span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5 cursor-pointer hover:text-[#5B4FE8]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </main>

        {/* RIGHT COLUMN: QUICK WRITE, STATS, COMMENTS (lg:col-span-3) */}
        <aside className="lg:col-span-3 space-y-8 pl-0 lg:pl-4 border-t lg:border-t-0 lg:border-l border-[#111111]/10 pt-8 lg:pt-0">
          
          {/* WIDGET 1: WRITE A NEW POST */}
          <div className="dashboard-widget-card space-y-4">
            <div className="flex justify-between items-center border-b border-[#111111]/10 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] font-mono">Write a new post</h3>
              {user && <span className="text-[9px] text-[#666666]/60 font-mono italic">Saved as draft</span>}
            </div>

            <form onSubmit={handleQuickWriteSubmit} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[10px] uppercase text-[#666666]">Title</label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="The Future of Developer Experience"
                  className="w-full px-2.5 py-1.5 bg-transparent border border-[#111111]/20 rounded-[4px] focus:outline-none focus:border-[#5B4FE8]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[10px] uppercase text-[#666666] block">Slug</label>
                <input
                  type="text"
                  value={slugify(quickTitle)}
                  readOnly
                  placeholder="the-future-of-developer-experience"
                  className="w-full px-2.5 py-1.5 bg-[#111111]/5 border border-[#111111]/10 rounded-[4px] text-gray-500 font-mono select-all focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[10px] uppercase text-[#666666] block">Tags</label>
                <div className="flex flex-wrap gap-1 border border-[#111111]/20 rounded-[4px] p-1.5 bg-transparent items-center">
                  {quickTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center bg-[#5B4FE8]/10 text-[#5B4FE8] text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-[10px] font-bold hover:text-red-500 cursor-pointer">×</button>
                    </span>
                  ))}
                  
                  {showAddTag ? (
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onBlur={handleAddTag}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                      autoFocus
                      className="border-0 p-0 text-[9px] w-12 bg-transparent focus:ring-0 focus:outline-none text-[#111111]"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddTag(true)}
                      className="text-[#5B4FE8] font-bold text-xs px-1 cursor-pointer"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={quickWriteLoading}
                className="w-full btn-accent py-2 text-xs font-semibold uppercase tracking-wider flex justify-center items-center"
              >
                {quickWriteLoading ? (
                  <div className="w-4 h-4 border-t-2 border-r-2 border-[#F7F5F0] rounded-full animate-spin"></div>
                ) : (
                  'Continue Writing ➔'
                )}
              </button>
            </form>
          </div>

          {/* WIDGET 2: DASHBOARD STATS */}
          <div className="dashboard-widget-card space-y-4">
            <div className="flex justify-between items-center border-b border-[#111111]/10 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] font-mono">Dashboard</h3>
              <span className="text-[9px] text-[#666666]/60 font-mono">Weekly Overview</span>
            </div>

            {/* Metrics grid 2x2 */}
            <div className="grid grid-cols-2 gap-3 text-sans">
              {/* Total Posts */}
              <div className="bg-[#111111]/5 border border-[#111111]/10 rounded-[4px] p-2.5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-[#666666] font-semibold">Total Posts</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold font-serif text-[#111111]">{widgetStats.posts}</span>
                  <span className="text-[9px] text-green-600 font-semibold">↑ 12%</span>
                </div>
              </div>

              {/* Total Views */}
              <div className="bg-[#111111]/5 border border-[#111111]/10 rounded-[4px] p-2.5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-[#666666] font-semibold">Total Views</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold font-serif text-[#111111]">{widgetStats.views}{!user && 'K'}</span>
                  <span className="text-[9px] text-green-600 font-semibold">↑ 28%</span>
                </div>
              </div>

              {/* Total Likes */}
              <div className="bg-[#111111]/5 border border-[#111111]/10 rounded-[4px] p-2.5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-[#666666] font-semibold">Total Likes</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold font-serif text-[#111111]">{widgetStats.likes}{!user && 'K'}</span>
                  <span className="text-[9px] text-green-600 font-semibold">↑ 18%</span>
                </div>
              </div>

              {/* Total Comments */}
              <div className="bg-[#111111]/5 border border-[#111111]/10 rounded-[4px] p-2.5 space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-[#666666] font-semibold">Comments</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold font-serif text-[#111111]">{widgetStats.comments}</span>
                  <span className="text-[9px] text-green-600 font-semibold">↑ 9%</span>
                </div>
              </div>
            </div>

            {/* SVG Sparkline chart views overview */}
            <div className="pt-2">
              <span className="text-[9px] uppercase tracking-wider text-[#666666] font-semibold block mb-2 font-mono">Views Trend</span>
              <div className="w-full h-12 bg-[#111111]/5 border border-[#111111]/10 rounded-[4px] flex items-center justify-center p-1 overflow-hidden relative">
                <svg viewBox="0 0 100 30" className="w-full h-full text-[#5B4FE8]" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5B4FE8" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#5B4FE8" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {/* Fill path under the curve */}
                  <path d="M 0 25 Q 15 10 30 18 T 60 12 T 90 8 L 100 5 L 100 30 L 0 30 Z" fill="url(#chartGradient)"/>
                  {/* Line path */}
                  <path d="M 0 25 Q 15 10 30 18 T 60 12 T 90 8 L 100 5" fill="none" stroke="#5B4FE8" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* WIDGET 3: RECENT COMMENTS */}
          <div className="dashboard-widget-card space-y-4">
            <div className="flex justify-between items-center border-b border-[#111111]/10 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] font-mono">Recent Comments</h3>
              <span className="text-[9px] text-[#666666]/60 font-mono">Live</span>
            </div>

            {/* List */}
            <div className="space-y-4 max-h-56 overflow-y-auto pr-1 hide-scrollbar">
              {recentComments.length === 0 ? (
                <p className="text-xs text-[#666666] italic font-light">No comments to display.</p>
              ) : (
                recentComments.map((comment) => (
                  <div key={comment._id} className="space-y-1 text-xs">
                    {/* User row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {comment.author?.avatar ? (
                          <img
                            src={comment.author.avatar.startsWith('/') ? `http://localhost:5000${comment.author.avatar}` : comment.author.avatar}
                            alt={comment.author.name}
                            className="w-5 h-5 rounded-full object-cover border border-[#111111]/15"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-[9px] font-bold uppercase">{comment.author?.name ? comment.author.name.charAt(0) : 'U'}</div>
                        )}
                        <span className="font-semibold text-[#111111]">{comment.author?.name}</span>
                        {comment.author?.username === 'antigravity' && (
                          <span className="bg-[#5B4FE8]/10 text-[#5B4FE8] text-[8px] font-bold px-1 rounded-[2px]">Author</span>
                        )}
                      </div>
                      <span className="text-[9px] text-[#666666]/70">{formatRelativeTime(comment.createdAt)}</span>
                    </div>

                    {/* Text content */}
                    <p className="text-[11px] text-[#666666] font-light leading-relaxed pl-7">
                      {comment.body}
                    </p>

                    {/* Meta replies */}
                    <div className="flex items-center space-x-3 pl-7 text-[9px] text-[#666666]/60 font-semibold uppercase">
                      <button type="button" className="hover:text-[#5B4FE8] cursor-pointer">Reply</button>
                      <span className="flex items-center space-x-0.5 cursor-pointer hover:text-red-500">
                        <span>♥</span>
                        <span>{comment.likes ? comment.likes : 3}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleCommentSubmit} className="pt-2 border-t border-[#111111]/10 flex space-x-2">
              <input
                type="text"
                value={newCommentBody}
                onChange={(e) => setNewCommentBody(e.target.value)}
                placeholder={user ? "Write a comment..." : "Sign in to write a comment"}
                disabled={!user || posts.length === 0}
                className="flex-1 px-3 py-1.5 bg-transparent border border-[#111111]/20 rounded-[4px] text-xs placeholder-[#666666]/50 focus:outline-none focus:border-[#5B4FE8] disabled:bg-[#111111]/5"
                required
              />
              <button
                type="submit"
                disabled={!user || !newCommentBody.trim() || posts.length === 0}
                className="btn-accent px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </aside>

      </div>

      {/* HIGHLIGHTS HORIZONTAL BANNER (Spanning full-width below columns) */}
      <section className="bg-[#111111]/3 border-t border-b border-[#111111]/10 mt-12 py-8">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-6 gap-6 text-center md:text-left font-sans">
          {/* Item 1 */}
          <div className="space-y-1 flex flex-col items-center md:items-start">
            <div className="text-[#5B4FE8]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Debounced Views</h4>
            <p className="text-[10px] text-[#666666] font-light leading-snug">Count views once per session.</p>
          </div>

          {/* Item 2 */}
          <div className="space-y-1 flex flex-col items-center md:items-start">
            <div className="text-[#5B4FE8]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Drafts & Publishing</h4>
            <p className="text-[10px] text-[#666666] font-light leading-snug">Private until you publish.</p>
          </div>

          {/* Item 3 */}
          <div className="space-y-1 flex flex-col items-center md:items-start">
            <div className="text-[#5B4FE8]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
              </svg>
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Optimistic UI</h4>
            <p className="text-[10px] text-[#666666] font-light leading-snug">Instant likes & comments.</p>
          </div>

          {/* Item 4 */}
          <div className="space-y-1 flex flex-col items-center md:items-start">
            <div className="text-[#5B4FE8]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Uploads Fallback</h4>
            <p className="text-[10px] text-[#666666] font-light leading-snug">Local folders or Cloudinary.</p>
          </div>

          {/* Item 5 */}
          <div className="space-y-1 flex flex-col items-center md:items-start">
            <div className="text-[#5B4FE8]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">JWT Auth</h4>
            <p className="text-[10px] text-[#666666] font-light leading-snug">Secure & extendable.</p>
          </div>

          {/* Item 6 */}
          <div className="space-y-1 flex flex-col items-center md:items-start">
            <div className="text-[#5B4FE8]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Search & Filters</h4>
            <p className="text-[10px] text-[#666666] font-light leading-snug">Smart content discovery.</p>
          </div>
        </div>
      </section>

      {/* FOOTER BANNER (Dark editorial footer matching mock) */}
      <footer className="bg-[#111111] text-[#F7F5F0]/80 py-10 font-sans text-xs">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-1 text-[#F7F5F0]">
              <span className="font-bold tracking-tight">Authoryn</span>
              <span className="text-[#5B4FE8] font-bold">✦</span>
            </div>
            <span className="text-[#666666]">© 2025 Authoryn. All rights reserved.</span>
          </div>

          {/* Nav links */}
          <div className="flex space-x-6 text-[#666666]">
            <a href="#privacy" className="hover:text-[#F7F5F0] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[#F7F5F0] transition-colors">Terms</a>
            <a href="#contact" className="hover:text-[#F7F5F0] transition-colors">Contact</a>
            <a href="#about" className="hover:text-[#F7F5F0] transition-colors">About</a>
          </div>

          {/* Quote right */}
          <div className="flex items-center space-x-2 italic text-[#666666]">
            <span>"The best ideas rise above."</span>
            <span className="text-[#5B4FE8] font-bold">✦</span>
          </div>
        </div>
      </footer>

      {/* Hidden Anchor for Scroll to Branding About */}
      <div id="branding" />
    </div>
  );
};

export default Home;

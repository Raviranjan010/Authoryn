import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePosts from '../hooks/usePosts';
import useAuth from '../hooks/useAuth';
import BlogCard from '../components/BlogCard';
import { BlogGridSkeleton } from '../components/SkeletonLoader';
import { RiLeafLine, RiDatabaseLine, RiServerLine, RiMacLine } from 'react-icons/ri';
import { FiArrowRight, FiUserCheck, FiEdit2, FiMessageSquare, FiShield, FiHeart, FiEye, FiArrowUpRight, FiCornerDownRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Home = () => {
  const { getPosts, loading } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await getPosts({ limit: 4, sort: 'newest' });
        if (response.success) {
          setPosts(response.posts);
        }
      } catch (err) {
        console.error('Failed to load home page posts:', err);
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary pb-16 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center overflow-x-hidden">
        
        {/* Hero Left Content (takes 5 cols) */}
        <div className="lg:col-span-5 space-y-8 text-left">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-soft-accent/50 text-accent-green rounded-full text-xs font-semibold font-sans tracking-wide">
            <span className="w-1.5 h-1.5 bg-accent-green rounded-full"></span>
            <span>Full Stack Blogging System</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold font-serif leading-[1.08] tracking-tight">
            Share Ideas.<br />
            Inspire <span className="relative inline-block text-accent-green">
              Readers.
              {/* Green SVG scribble line under Readers */}
              <svg className="absolute -bottom-2 left-0 w-full h-2 text-accent-green" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,7 Q50,0 100,7" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[15px] md:text-[16px] text-text-secondary leading-relaxed font-light max-w-lg">
            A modern blogging platform where users can write, share and manage content effortlessly.
            Built with authentication, real-time interactions, and a clean reading experience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            {user ? (
              <Link to="/write" className="btn-primary flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all">
                <span>Start Writing</span>
                <FiArrowRight />
              </Link>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className="btn-primary flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <FiArrowRight />
              </button>
            )}
            <Link to="/explore" className="btn-outline flex items-center space-x-2 px-6 py-3 rounded-full font-bold border-accent-green text-accent-green hover:bg-soft-accent/25 transition-all">
              <span>Explore Posts</span>
            </Link>
          </div>

          {/* Mini Statistics Row */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border-light max-w-md">
            <div>
              <p className="text-2xl font-bold font-serif text-text-primary">1K+</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Active Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-text-primary">2K+</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Blog Posts</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-text-primary">5K+</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Comments</p>
            </div>
          </div>
        </div>

        {/* Hero Right Floating Dashboard Preview (takes 7 cols) */}
        <div className="lg:col-span-7 relative h-[520px] md:h-[600px] flex items-center justify-center">
          
          {/* Main Dashboard Preview Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[560px] bg-white border border-border-light rounded-2xl shadow-premium p-6 pb-20 space-y-6 select-none relative z-10"
          >
            {/* Header row */}
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <div className="flex items-center space-x-2">
                <RiLeafLine className="text-accent-green text-xl" />
                <span className="font-bold text-sm">LeafBlog</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-text-secondary font-medium">
                <span className="w-24 h-6 bg-background rounded-full flex items-center px-2.5 text-[10px] border border-border-light/60">
                  Search posts...
                </span>
                <span className="px-3 py-1 bg-accent-green hover:bg-dark-green text-white text-[10px] font-bold rounded-full">New Post</span>
                <div className="w-6 h-6 rounded-full bg-accent-green text-white flex items-center justify-center text-[10px] font-bold">JD</div>
              </div>
            </div>

            {/* Layout simulation */}
            <div className="grid grid-cols-4 gap-4 text-left">
              {/* Fake Sidebar */}
              <div className="col-span-1 space-y-2 border-r border-border-light pr-2">
                <span className="block px-2 py-1 bg-soft-accent/20 text-accent-green text-[10px] font-bold rounded-md">Home</span>
                <span className="block px-2 py-1 text-text-secondary text-[10px] font-medium hover:text-text-primary">Explore</span>
                <span className="block px-2 py-1 text-text-secondary text-[10px] font-medium hover:text-text-primary">My Posts</span>
                <span className="block px-2 py-1 text-text-secondary text-[10px] font-medium hover:text-text-primary">Settings</span>
              </div>

              {/* Fake Content Area */}
              <div className="col-span-3 space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent-green">Featured Post</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-serif leading-tight">Building Scalable Web Applications</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 font-light">Learn how to design and build scalable web applications using modern technologies.</p>
                </div>

                {/* Cover representation */}
                <div className="w-full h-32 overflow-hidden rounded-lg bg-gray-100 border border-border-light">
                  <img 
                    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80" 
                    alt="Scalable web app mock cover" 
                    className="w-full h-full object-cover opacity-85" 
                  />
                </div>

                {/* Author meta */}
                <div className="flex items-center justify-between text-[10px] text-text-secondary font-medium">
                  <span className="hover:underline">By John Doe • May 15, 2026</span>
                  <span className="text-accent-green font-bold flex items-center space-x-0.5">
                    <span>Read More</span>
                    <FiArrowRight className="text-[8px]" />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Comments Widget (overlaid bottom-left) */}
          <motion.div 
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="absolute bottom-6 left-2 md:-left-8 bg-white border border-border-light rounded-xl shadow-float p-5 w-64 text-left z-20 select-none hidden sm:block"
          >
            <h4 className="text-xs font-bold text-text-primary mb-3">Comments (3)</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center font-bold text-[9px]">A</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold">Alice</span>
                    <span className="text-[8px] text-text-secondary">2h</span>
                  </div>
                  <p className="text-[9px] text-text-secondary leading-snug">Great insights! Very helpful.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-[9px]">M</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold">Mark</span>
                    <span className="text-[8px] text-text-secondary">5h</span>
                  </div>
                  <p className="text-[9px] text-text-secondary leading-snug">Thanks for sharing this!</p>
                </div>
              </div>
            </div>
            
            {/* Input bar */}
            <div className="mt-4 pt-3 border-t border-border-light/80 flex items-center justify-between text-[9px]">
              <span className="text-text-secondary">Write a comment...</span>
              <span className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center text-white text-[9px]">➔</span>
            </div>
          </motion.div>

          {/* Floating Create Post Widget (overlaid bottom-right) */}
          <motion.div 
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -5 }}
            className="absolute bottom-16 right-2 md:-right-8 bg-white border border-border-light rounded-xl shadow-float p-5 w-64 text-left z-20 select-none hidden md:block"
          >
            <h4 className="text-xs font-bold text-text-primary mb-3">Create New Post</h4>
            <div className="space-y-2 text-[10px]">
              <div>
                <label className="text-[8px] uppercase tracking-wider font-bold text-text-secondary block mb-1">Title</label>
                <div className="w-full bg-background border border-border-light px-2 py-1 rounded text-text-secondary">Enter post title...</div>
              </div>
              <div>
                <label className="text-[8px] uppercase tracking-wider font-bold text-text-secondary block mb-1">Content</label>
                <div className="w-full bg-background border border-border-light p-2 rounded text-text-secondary">
                  <div className="flex space-x-1.5 border-b border-border-light/60 pb-1 mb-1 text-[8px] font-bold">
                    <span>B</span><span>I</span><span>Link</span><span>Code</span>
                  </div>
                  <span className="text-[9px] leading-snug">Write your content here...</span>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <span className="px-3 py-1 bg-accent-green text-white text-[9px] font-bold rounded-md">Publish</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section className="bg-white border-t border-b border-border-light py-20 px-6 md:px-12 text-center">
        <div className="max-w-[1200px] mx-auto space-y-16">
          <div className="space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-accent-green">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-text-primary leading-tight">
              Everything you need to build and manage your blog
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 border border-border-light rounded-xl text-left bg-background space-y-4 hover:border-accent-green/30 transition-all duration-300">
              <div className="w-12 h-12 bg-soft-accent text-accent-green rounded-xl flex items-center justify-center text-xl shadow-sm">
                <FiUserCheck />
              </div>
              <h3 className="font-bold text-base">User Authentication</h3>
              <p className="text-xs text-text-secondary font-light leading-relaxed">
                Secure registration and login featuring persistent JWT token storage in HTTP-only cookies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 border border-border-light rounded-xl text-left bg-background space-y-4 hover:border-accent-green/30 transition-all duration-300">
              <div className="w-12 h-12 bg-soft-accent text-accent-green rounded-xl flex items-center justify-center text-xl shadow-sm">
                <FiEdit2 />
              </div>
              <h3 className="font-bold text-base">Create & Manage Posts</h3>
              <p className="text-xs text-text-secondary font-light leading-relaxed">
                A rich markdown and HTML editor with cover image uploading, status selectors, and live previews.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 border border-border-light rounded-xl text-left bg-background space-y-4 hover:border-accent-green/30 transition-all duration-300">
              <div className="w-12 h-12 bg-soft-accent text-accent-green rounded-xl flex items-center justify-center text-xl shadow-sm">
                <FiMessageSquare />
              </div>
              <h3 className="font-bold text-base">Comment System</h3>
              <p className="text-xs text-text-secondary font-light leading-relaxed">
                Engage with readers seamlessly through article discussions with instant optimistic feedback.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 border border-border-light rounded-xl text-left bg-background space-y-4 hover:border-accent-green/30 transition-all duration-300">
              <div className="w-12 h-12 bg-soft-accent text-accent-green rounded-xl flex items-center justify-center text-xl shadow-sm">
                <FiShield />
              </div>
              <h3 className="font-bold text-base">Protected Routes</h3>
              <p className="text-xs text-text-secondary font-light leading-relaxed">
                Secure control panels and creation sheets restricted to verified authors and administrators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LATEST POSTS SECTION */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div className="space-y-3 text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-accent-green block">Latest Posts</span>
            <h2 className="text-3xl font-bold font-serif text-text-primary leading-tight">
              Discover stories from our community
            </h2>
          </div>
          <Link to="/explore" className="flex items-center space-x-1 text-xs font-bold text-accent-green hover:underline uppercase tracking-wider">
            <span>View all posts</span>
            <FiArrowUpRight className="text-base" />
          </Link>
        </div>

        {/* Loading / Cards Grid */}
        {loading ? (
          <BlogGridSkeleton count={3} />
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border-light rounded-xl p-8">
            <h3 className="text-lg font-bold font-serif mb-2">No posts available yet</h3>
            <p className="text-text-secondary text-sm font-light mb-4">Run the seed script or log in to author the first article.</p>
            <Link to="/write" className="btn-primary text-xs px-4 py-2">Create a Post</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(0, 3).map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* 4. TECH STACK & SYSTEM OVERVIEW DIAGRAM */}
      <section className="bg-white border-t border-b border-border-light py-20 px-6 md:px-12 text-center overflow-x-hidden font-sans">
        <div className="max-w-[1200px] mx-auto space-y-16">
          <div className="space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-accent-green">Architecture Overview</span>
            <h2 className="text-3xl font-bold font-serif text-text-primary">
              Built on Modern Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Tech stack panel (takes 5 cols) */}
            <div className="lg:col-span-5 bg-background border border-border-light rounded-2xl p-8 text-left flex flex-col justify-between space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-green font-mono">Modern Stack</span>
                <h3 className="text-lg font-bold">MERN Core Architecture</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-light">
                  A unified JavaScript framework using React.js for fast UI updates, Node/Express for resilient REST logic, and MongoDB for flexible data modeling.
                </p>
              </div>

              {/* Stacks row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-border-light rounded-xl text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center text-lg mx-auto">
                    <RiDatabaseLine />
                  </div>
                  <p className="text-xs font-bold">MongoDB</p>
                  <p className="text-[9px] text-text-secondary font-mono">Database</p>
                </div>
                <div className="p-4 bg-white border border-border-light rounded-xl text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center text-lg mx-auto">
                    <RiServerLine />
                  </div>
                  <p className="text-xs font-bold">Express.js</p>
                  <p className="text-[9px] text-text-secondary font-mono">Server Router</p>
                </div>
                <div className="p-4 bg-white border border-border-light rounded-xl text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-accent-green flex items-center justify-center text-lg mx-auto">
                    <RiLeafLine />
                  </div>
                  <p className="text-xs font-bold">Node.js</p>
                  <p className="text-[9px] text-text-secondary font-mono">Runtime API</p>
                </div>
                <div className="p-4 bg-white border border-border-light rounded-xl text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg mx-auto">
                    <RiMacLine />
                  </div>
                  <p className="text-xs font-bold">React.js</p>
                  <p className="text-[9px] text-text-secondary font-mono">Client Interface</p>
                </div>
              </div>
            </div>

            {/* Architecture diagram panel (takes 7 cols) */}
            <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-8 text-left text-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 font-mono">System Overview</span>
                <h3 className="text-lg font-bold text-white">Client-Server Communication Flow</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  A visual flow of API queries. Cookies manage authentication, while JSON REST calls retrieve database records securely from MongoDB.
                </p>
              </div>

              {/* Visual flow chart */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center pt-8 font-mono text-[9px] sm:text-[10px]">
                
                {/* Box 1: Client */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center space-y-2 shadow-lg">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm mx-auto">
                    <RiMacLine />
                  </div>
                  <div>
                    <p className="font-bold text-white">Client</p>
                    <p className="text-slate-400">React.js</p>
                  </div>
                </div>

                {/* Arrow 1 */}
                <div className="text-center space-y-1 relative">
                  <div className="flex items-center justify-center text-slate-500 font-bold">
                    <span>HTTP / REST</span>
                  </div>
                  <div className="h-[2px] bg-slate-700 w-full relative">
                    <span className="absolute -top-1.5 right-0 text-slate-600 text-xs">➔</span>
                    <span className="absolute -top-1.5 left-0 text-slate-600 text-xs">&larr;</span>
                  </div>
                  <span className="text-slate-400 block">JSON Data</span>
                </div>

                {/* Box 2: Server */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center space-y-2 shadow-lg">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm mx-auto">
                    <RiServerLine />
                  </div>
                  <div>
                    <p className="font-bold text-white">Server</p>
                    <p className="text-slate-400">Express.js</p>
                  </div>
                </div>

              </div>
              
              {/* Additional Flow Indicator */}
              <div className="flex items-center space-x-2 pt-6 text-[10px] text-slate-400 font-mono">
                <FiCornerDownRight className="text-emerald-500" />
                <span>MongoDB queried via Mongoose connection queries inside Node controllers.</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

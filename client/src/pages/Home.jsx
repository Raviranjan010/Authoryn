import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import useDebounce from '../hooks/useDebounce';
import { formatAbsoluteDate } from '../utils/formatDate';
import { calculateReadTime } from '../utils/readTime';

export const Home = () => {
  const { getPosts, loading } = usePosts();

  // Feed State
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedTag, setSelectedTag] = useState('');
  
  // Debounce search input by 400ms
  const debouncedSearch = useDebounce(search, 400);

  const loadFeedPosts = async () => {
    try {
      const params = {
        limit: 12,
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

  useEffect(() => {
    loadFeedPosts();
  }, [debouncedSearch, sort, selectedTag]);

  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111111] pb-24">
      
      {/* HEADER FILTERS (Sub-navbar) */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center border-b border-[#111111]/10 gap-4">
        <div className="flex space-x-6 text-[13px] uppercase tracking-widest font-bold text-[#666666]">
          <button onClick={() => setSelectedTag('')} className={`${selectedTag === '' ? 'text-[#111111] border-b-2 border-[#111111]' : 'hover:text-[#5B4FE8]'}`}>All Stories</button>
          <button onClick={() => setSelectedTag('technology')} className={`${selectedTag === 'technology' ? 'text-[#111111] border-b-2 border-[#111111]' : 'hover:text-[#5B4FE8]'}`}>Technology</button>
          <button onClick={() => setSelectedTag('design')} className={`${selectedTag === 'design' ? 'text-[#111111] border-b-2 border-[#111111]' : 'hover:text-[#5B4FE8]'}`}>Design</button>
          <button onClick={() => setSelectedTag('culture')} className={`${selectedTag === 'culture' ? 'text-[#111111] border-b-2 border-[#111111]' : 'hover:text-[#5B4FE8]'}`}>Culture</button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-48 md:w-64 pl-10 pr-4 py-2 bg-transparent border border-[#111111]/20 focus:border-[#5B4FE8] rounded-full text-[15px] placeholder-[#666666] focus:outline-none transition-colors"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 absolute left-3.5 top-2 text-[#666666]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-12">
        {/* Loading State */}
        {loading && posts.length === 0 && (
          <div className="py-32 text-center text-lg text-[#666666]">
            <div className="w-8 h-8 border-t-2 border-r-2 border-[#111111] rounded-full animate-spin mx-auto mb-4"></div>
            Curating stories...
          </div>
        )}

        {/* HERO FEATURED POST */}
        {!loading && featuredPost && (
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Cover Image */}
              <Link to={`/post/${featuredPost.slug}`} className="block w-full h-[400px] md:h-[600px] overflow-hidden rounded-lg">
                <img
                  src={featuredPost.coverImage ? (featuredPost.coverImage.startsWith('/') ? `http://localhost:5000${featuredPost.coverImage}` : featuredPost.coverImage) : 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=1200&q=80'}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </Link>
              
              {/* Featured Info */}
              <div className="space-y-6">
                <span className="text-[13px] font-bold tracking-widest text-[#5B4FE8] uppercase">
                  {featuredPost.tags && featuredPost.tags.length > 0 ? featuredPost.tags[0] : 'Featured Story'}
                </span>
                <Link to={`/post/${featuredPost.slug}`} className="block">
                  <h1 className="text-4xl md:text-6xl font-bold font-serif text-[#111111] leading-[1.1] hover:text-[#5B4FE8] transition-colors">
                    {featuredPost.title}
                  </h1>
                </Link>
                <p className="text-lg md:text-xl text-[#666666] leading-relaxed line-clamp-3 font-light">
                  {featuredPost.body ? featuredPost.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''}
                </p>

                {/* Author Metdata */}
                <div className="flex items-center space-x-4 pt-4">
                  <Link to={`/author/${featuredPost.author?.username}`}>
                    {featuredPost.author?.avatar ? (
                      <img
                        src={featuredPost.author.avatar.startsWith('/') ? `http://localhost:5000${featuredPost.author.avatar}` : featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-lg font-bold uppercase">
                        {featuredPost.author?.name ? featuredPost.author.name.charAt(0) : 'U'}
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link to={`/author/${featuredPost.author?.username}`} className="text-[15px] font-bold text-[#111111] hover:underline block">
                      {featuredPost.author?.name}
                    </Link>
                    <span className="text-[14px] text-[#666666]">{formatAbsoluteDate(featuredPost.createdAt)} • {calculateReadTime(featuredPost.body)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FEED GRID */}
        {!loading && gridPosts.length > 0 && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {gridPosts.map((post) => {
                const coverUrl = post.coverImage
                  ? (post.coverImage.startsWith('/') ? `http://localhost:5000${post.coverImage}` : post.coverImage)
                  : 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=600&q=80';
                
                const category = post.tags && post.tags.length > 0 ? post.tags[0] : 'Article';

                return (
                  <article key={post._id} className="group cursor-pointer">
                    <Link to={`/post/${post.slug}`} className="block overflow-hidden rounded-lg mb-4 h-64 border border-[#111111]/5">
                      <img src={coverUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    
                    <span className="text-[11px] font-bold tracking-widest text-[#5B4FE8] uppercase mb-2 block">{category}</span>
                    
                    <Link to={`/post/${post.slug}`}>
                      <h3 className="text-2xl font-bold font-serif text-[#111111] leading-snug mb-3 group-hover:text-[#5B4FE8] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-[15px] text-[#666666] leading-relaxed line-clamp-3 mb-4 font-light">
                      {post.body ? post.body.replace(/<[^>]*>/g, ' ').trim() : ''}
                    </p>

                    <div className="flex items-center justify-between text-[13px] text-[#111111] font-medium border-t border-[#111111]/10 pt-4">
                      <Link to={`/author/${post.author?.username}`} className="hover:underline">By {post.author?.name}</Link>
                      <span className="text-[#666666] font-light">{formatAbsoluteDate(post.createdAt)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-serif text-[#111111] mb-2">No stories found.</h2>
            <p className="text-[#666666]">Try adjusting your search or check back later.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;

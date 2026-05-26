import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import useDebounce from '../hooks/useDebounce';
import PostCard from '../components/PostCard';
import TagPill from '../components/TagPill';

const AVAILABLE_TAGS = ['technology', 'design', 'culture'];

export const Home = () => {
  const { tag: routeTag } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getPosts, loading } = usePosts();

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // Debounce search input by 400ms
  const debouncedSearch = useDebounce(search, 400);

  // Fetch posts when dependencies change
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const queryParams = {
          page,
          limit: 8,
          sort,
          search: debouncedSearch,
          tag: routeTag || ''
        };
        const data = await getPosts(queryParams);
        if (data.success) {
          setPosts(data.posts);
          setTotalPages(data.pages);
          setTotalPosts(data.total);
        }
      } catch (err) {
        console.error('Error loading posts:', err);
      }
    };
    loadPosts();
  }, [routeTag, debouncedSearch, sort, page]);

  // Reset page when search or tag changes
  useEffect(() => {
    setPage(1);
  }, [routeTag, debouncedSearch, sort]);

  const handleTagClick = (clickedTag) => {
    if (routeTag === clickedTag) {
      // Toggle off if clicking the active tag
      navigate('/');
    } else {
      navigate(`/tag/${clickedTag}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] pt-24 pb-20 px-6 font-sans">
      <div className="max-w-[720px] mx-auto space-y-12">
        {/* Large Editorial Header */}
        <header className="space-y-3 pt-6">
          <h1 className="text-6xl md:text-[64px] font-semibold text-[#111111] leading-none tracking-tight font-serif">
            Antigravity<span className="text-[#5B4FE8]">.</span>
          </h1>
          <p className="text-lg md:text-[18px] text-[#666666] font-light leading-relaxed">
            Writing that defies gravity.
          </p>
        </header>

        {/* Discovery Row: Inline Search & Sort */}
        <section className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 py-2 border-b border-[#111111]/10">
          {/* Search bar, expands on focus */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full sm:max-w-[200px] focus:sm:max-w-xs transition-all duration-300 px-3 py-1.5 bg-transparent border border-[#111111]/20 focus:border-[#5B4FE8] rounded-[4px] text-sm font-light placeholder-[#666666]/50 focus:outline-none"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-xs text-[#666666] uppercase tracking-wider font-semibold">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent border border-[#111111]/20 focus:border-[#5B4FE8] rounded-[4px] py-1 px-2.5 text-xs font-medium focus:outline-none text-[#111111] cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="views">Most Viewed</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </section>

        {/* Horizontal scrollable Tag Filter Bar */}
        <section>
          <div className="flex space-x-2.5 overflow-x-auto pb-2 hide-scrollbar scroll-smooth">
            {AVAILABLE_TAGS.map((tag) => (
              <TagPill
                key={tag}
                tag={tag}
                isActive={routeTag === tag}
                onClick={handleTagClick}
              />
            ))}
          </div>
        </section>

        {/* Posts Feed Vertical List */}
        <main className="space-y-1">
          {loading ? (
            <div className="py-20 text-center font-sans font-light text-sm text-[#666666]">
              <div className="w-6 h-6 border-t-2 border-r-2 border-[#111111] animate-spin mx-auto mb-4"></div>
              Loading entries...
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#666666] italic font-light">
              No articles found matching the criteria.
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </main>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <nav className="flex justify-between items-center pt-8 border-t border-[#111111]/15 font-sans">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="btn-outline text-xs px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-xs text-[#666666] font-light">
              Page {page} of {totalPages} ({totalPosts} posts)
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="btn-outline text-xs px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Home;

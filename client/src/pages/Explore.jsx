import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import useDebounce from '../hooks/useDebounce';
import BlogCard from '../components/BlogCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import Pagination from '../components/Pagination';
import { BlogGridSkeleton } from '../components/SkeletonLoader';
import { FiSliders } from 'react-icons/fi';

export const Explore = () => {
  const { getPosts, loading } = usePosts();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch States
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  
  // URL Params Binding
  
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  // Search input state (not immediately synced to URL to avoid lagging)
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync debounced search to URL params
  useEffect(() => {
    setSearchParams((prev) => {
      if (debouncedSearch) {
        prev.set('search', debouncedSearch);
      } else {
        prev.delete('search');
      }
      prev.set('page', '1'); // reset to page 1 on search
      return prev;
    });
  }, [debouncedSearch]);

  // Sync category selection to URL params
  const handleCategorySelect = (selectedCat) => {
    setSearchParams((prev) => {
      if (selectedCat) {
        prev.set('category', selectedCat);
      } else {
        prev.delete('category');
      }
      prev.set('page', '1'); // reset to page 1
      return prev;
    });
  };

  // Sync sorting selection
  const handleSortSelect = (selectedSort) => {
    setSearchParams((prev) => {
      prev.set('sort', selectedSort);
      prev.set('page', '1');
      return prev;
    });
  };

  // Sync pagination
  const handlePageChange = (selectedPage) => {
    setSearchParams((prev) => {
      prev.set('page', String(selectedPage));
      return prev;
    });
  };

  const loadExplorePosts = async () => {
    try {
      const params = {
        page,
        limit: 9,
        sort,
        search,
        category
      };
      const response = await getPosts(params);
      if (response.success) {
        setPosts(response.posts);
        setTotalPages(response.pages);
      }
    } catch (err) {
      console.error('Failed to load explore posts:', err);
    }
  };

  // Load posts whenever parameters change
  useEffect(() => {
    loadExplorePosts();
  }, [category, search, sort, page]);

  const categories = ['Development', 'Design', 'Culture'];

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20 font-sans">
      
      {/* Search & Intro Header */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-12 pb-8 text-left space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-serif leading-tight">Explore Articles</h1>
          <p className="text-sm text-text-secondary font-light max-w-lg">
            Discover thoughtful write-ups, code craftsmanship guides, and design thoughts from our creative curators.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pt-4 border-b border-border-light/60 pb-6">
          <SearchBar value={searchInput} onChange={setSearchInput} placeholder="Search stories by title or contents..." />
          
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 text-text-secondary font-semibold">
              <FiSliders />
              <span>Sort:</span>
            </div>
            <select
              value={sort}
              onChange={(e) => handleSortSelect(e.target.value)}
              className="bg-white border border-border-light focus:border-accent-green rounded-full px-4 py-2 font-semibold text-text-primary focus:outline-none cursor-pointer text-xs shadow-sm"
            >
              <option value="newest">Newest First</option>
              <option value="views">Most Views</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>

        {/* Categories list */}
        <CategoryFilter
          selectedCategory={category}
          onSelectCategory={handleCategorySelect}
          categories={categories}
        />
      </div>

      {/* Main Grid Area */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {loading ? (
          <BlogGridSkeleton count={6} />
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-border-light rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold font-serif mb-2">No matching stories</h2>
            <p className="text-text-secondary text-sm font-light">
              Try adjusting your query, search criteria, or category selectors.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
            
            {/* Pagination component */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

    </div>
  );
};

export default Explore;

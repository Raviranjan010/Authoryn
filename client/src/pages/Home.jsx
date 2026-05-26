import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import useDebounce from '../hooks/useDebounce';
import TagPill from '../components/TagPill';
import { calculateReadTime } from '../utils/readTime';
import { formatAbsoluteDate } from '../utils/formatDate';

const AVAILABLE_TAGS = ['technology', 'design', 'culture'];

const featureNotes = [
  ['Write and Publish', 'Rich editor, image uploads, tags, drafts, and publishing.'],
  ['Engage Readers', 'Likes, comments, and optimistic feedback for instant response.'],
  ['Discover Stories', 'Search, sort, and filter by tags, views, likes, or newest.'],
  ['Track Performance', 'A compact dashboard with key writing metrics.'],
  ['Secure and Reliable', 'JWT auth, remembered sessions, and owner controls.']
];

const feedFallback = [
  {
    title: 'Minimal APIs with Maximum Impact',
    tags: ['technology'],
    body: 'Building faster, cleaner, and more maintainable APIs with Node.js.',
    viewCount: 1300,
    likes: new Array(230),
    commentCount: 12,
    coverImage: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
    slug: 'minimal-apis-with-maximum-impact',
    author: { name: 'Ravi Ranjan', username: 'ravi' },
    createdAt: new Date().toISOString()
  },
  {
    title: 'Design Systems That Scale',
    tags: ['design'],
    body: 'Create consistent, flexible, and beautiful UI systems that grow.',
    viewCount: 980,
    likes: new Array(190),
    commentCount: 8,
    coverImage: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
    slug: 'design-systems-that-scale',
    author: { name: 'Ravi Ranjan', username: 'ravi' },
    createdAt: new Date().toISOString()
  },
  {
    title: 'Understanding Event Loop in Node.js',
    tags: ['technology'],
    body: 'A deep dive into timers, callbacks, and non-blocking I/O.',
    viewCount: 1100,
    likes: new Array(210),
    commentCount: 15,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80',
    slug: 'understanding-event-loop-in-node-js',
    author: { name: 'Ravi Ranjan', username: 'ravi' },
    createdAt: new Date().toISOString()
  }
];

const formatCount = (value = 0) => {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return value.toString();
};

const assetUrl = (src) => {
  if (!src) return '';
  return src.startsWith('/') ? `http://localhost:5000${src}` : src;
};

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const AuthorAvatar = ({ author, size = 'md' }) => {
  const dimension = size === 'lg' ? 'w-11 h-11' : 'w-8 h-8';
  if (author?.avatar) {
    return (
      <img
        src={assetUrl(author.avatar)}
        alt={author.name}
        className={`${dimension} rounded-full object-cover border border-[#101116]/15`}
      />
    );
  }

  return (
    <div className={`${dimension} rounded-full bg-[#101116] text-[#fbfaf6] flex items-center justify-center text-xs font-bold uppercase`}>
      {author?.name ? author.name.charAt(0) : 'A'}
    </div>
  );
};

const StoryImage = ({ src, alt, tone = 'stone' }) => {
  if (src) {
    return <img src={assetUrl(src)} alt={alt} className="h-full w-full object-cover grayscale contrast-110" />;
  }

  return (
    <div className={`story-fallback story-fallback-${tone}`} aria-label={alt}>
      <span />
    </div>
  );
};

export const Home = () => {
  const { tag: routeTag } = useParams();
  const navigate = useNavigate();
  const { getPosts, loading } = usePosts();

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getPosts({
          page,
          limit: 8,
          sort,
          search: debouncedSearch,
          tag: routeTag || ''
        });

        if (data.success) {
          setPosts(data.posts);
          setTotalPages(data.pages);
          setTotalPosts(data.total);
          setLoadFailed(false);
        }
      } catch (err) {
        console.error('Error loading posts:', err);
        setLoadFailed(true);
      } finally {
        setHasLoaded(true);
      }
    };

    loadPosts();
  }, [routeTag, debouncedSearch, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [routeTag, debouncedSearch, sort]);

  const handleTagClick = (clickedTag) => {
    navigate(routeTag === clickedTag ? '/' : `/tag/${clickedTag}`);
  };

  const useFallback = loadFailed || (!hasLoaded && !posts.length);
  const visiblePosts = posts.length ? posts : useFallback ? feedFallback : [];
  const featured = visiblePosts[0] || feedFallback[0];
  const latest = visiblePosts.slice(1, 4).length ? visiblePosts.slice(1, 4) : feedFallback;
  const featuredExcerpt = stripHtml(featured?.body).slice(0, 142);
  const totalViews = visiblePosts.reduce((sum, post) => sum + (post.viewCount || 0), 0);
  const totalLikes = visiblePosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const totalComments = visiblePosts.reduce((sum, post) => sum + (post.commentCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#fbfaf6] px-4 pb-8 pt-24 text-[#101116] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1780px] gap-5 xl:grid-cols-[460px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)] xl:min-h-[760px]">
          <div className="flex h-full flex-col justify-between rounded-[8px] border border-transparent py-4 xl:pr-20">
            <div>
              <Link to="/" className="brand-mark text-[34px] font-semibold tracking-tight">
                Authoryn <span aria-hidden="true">✦</span>
              </Link>

              <div className="mt-14 max-w-[390px]">
                <h1 className="editorial-serif text-[56px] font-black leading-[0.95] tracking-normal text-[#0c0c0f] sm:text-[76px]">
                  Writing that defies <em className="hero-underline not-italic">gravity</em>.
                </h1>
                <p className="mt-8 max-w-[350px] text-lg leading-8 text-[#33343a]">
                  Authoryn is a MERN stack blogging platform for bold ideas, deep insights, and timeless stories.
                </p>
              </div>

              <div className="mt-8 divide-y divide-[#101116]/12">
                {featureNotes.map(([title, copy], index) => (
                  <div key={title} className="grid grid-cols-[58px_1fr] gap-4 py-4">
                    <div className="feature-orb" aria-hidden="true">{['✎', '▱', '⌕', '▥', '◇'][index]}</div>
                    <div>
                      <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#2932ff]">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#33343a]">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#101116]/60">
                <span className="text-[#2dd4bf]">React</span>
                <span className="font-bold text-[#5d6b55]">node</span>
                <span>express</span>
                <span className="font-serif text-[#2f7d32]">mongoDB</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/write" className="btn-primary">Explore Demo <span>→</span></Link>
                <a href="https://github.com" className="btn-soft">View on GitHub</a>
              </div>
            </div>
          </div>
        </aside>

        <main className="rounded-[8px] border border-[#101116]/10 bg-[#fffefb]/88 p-4 shadow-[0_18px_80px_rgba(16,17,22,0.08)] backdrop-blur md:p-7">
          <div className="grid gap-7 2xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="min-w-0">
              <div className="mb-8 hidden items-center justify-between gap-4 lg:flex">
                <nav className="flex items-center gap-10 text-sm font-extrabold uppercase tracking-[0.08em]">
                  <Link to="/" className="nav-tab active">Home</Link>
                  <Link to="/#about" className="nav-tab">About</Link>
                  <Link to="/tag/design" className="nav-tab">Tags</Link>
                  <Link to="/dashboard" className="nav-tab">Authors</Link>
                </nav>
                <div className="flex min-w-[320px] items-center gap-3">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search articles..."
                    className="h-11 w-full rounded-[6px] border border-[#101116]/12 bg-white px-4 text-sm outline-none transition focus:border-[#2932ff]"
                  />
                  <Link to="/write" className="h-11 rounded-[6px] bg-[#2932ff] px-5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(41,50,255,0.22)]">
                    Write
                  </Link>
                </div>
              </div>

              <article className="grid gap-8 border-b border-[#101116]/12 pb-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_450px]">
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-black uppercase tracking-[0.1em] text-[#2932ff]">Featured</p>
                  <Link to={`/post/${featured.slug}`}>
                    <h2 className="editorial-serif mt-5 text-[42px] font-black leading-none tracking-normal text-[#0c0c0f] md:text-[58px]">
                      {featured.title}
                    </h2>
                  </Link>
                  <p className="mt-6 max-w-[560px] text-lg leading-8 text-[#33343a]">
                    {featuredExcerpt}{featuredExcerpt.length >= 142 ? '...' : ''}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <AuthorAvatar author={featured.author} size="lg" />
                    <div>
                      <Link to={`/author/${featured.author?.username}`} className="font-bold">
                        {featured.author?.name || 'Authoryn Writer'}
                      </Link>
                      <p className="text-sm text-[#55565c]">
                        {formatAbsoluteDate(featured.createdAt)} <span className="px-2">·</span> {calculateReadTime(featured.body)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-8 text-sm text-[#33343a]">
                    <span>◎ {formatCount(featured.viewCount || 0)}</span>
                    <span>♡ {formatCount(featured.likes?.length || 0)}</span>
                    <span>○ {featured.commentCount || 0}</span>
                  </div>
                </div>

                <Link to={`/post/${featured.slug}`} className="featured-image block overflow-hidden rounded-[8px] border border-[#101116]/12 bg-[#e6e1d7]">
                  <StoryImage src={featured.coverImage} alt={featured.title} />
                </Link>
              </article>

              <section className="pt-7">
                <div className="mb-5 flex flex-col gap-4 border-b border-[#101116]/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="editorial-serif text-2xl font-semibold">Latest from the feed</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <label htmlFor="sort" className="text-sm text-[#55565c]">Sort by</label>
                    <select
                      id="sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="h-10 rounded-[6px] border border-[#101116]/12 bg-white px-3 text-sm font-bold outline-none focus:border-[#2932ff]"
                    >
                      <option value="newest">Newest</option>
                      <option value="views">Most Viewed</option>
                      <option value="likes">Most Liked</option>
                    </select>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                      {AVAILABLE_TAGS.map((tag) => (
                        <TagPill key={tag} tag={tag} isActive={routeTag === tag} onClick={handleTagClick} />
                      ))}
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="grid min-h-[280px] place-items-center text-sm text-[#55565c]">Loading entries...</div>
                ) : visiblePosts.length === 0 ? (
                  <div className="grid min-h-[280px] place-items-center text-sm text-[#55565c]">No articles found.</div>
                ) : (
                  <div className="grid gap-5 lg:grid-cols-3">
                    {latest.map((post, index) => {
                      const excerpt = stripHtml(post.body).slice(0, 105);
                      return (
                        <article key={post._id || post.slug} className="story-card">
                          <Link to={`/post/${post.slug}`} className="block h-36 overflow-hidden bg-[#dad4c8]">
                            <StoryImage src={post.coverImage} alt={post.title} tone={index % 2 ? 'arch' : 'code'} />
                          </Link>
                          <div className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {(post.tags || []).slice(0, 2).map((tag) => (
                                <Link key={tag} to={`/tag/${tag}`} className="text-[11px] font-black uppercase tracking-[0.08em] text-[#2932ff]">
                                  {tag}
                                </Link>
                              ))}
                            </div>
                            <Link to={`/post/${post.slug}`}>
                              <h4 className="editorial-serif mt-3 text-[22px] font-semibold leading-tight">{post.title}</h4>
                            </Link>
                            <p className="mt-3 min-h-[48px] text-sm leading-6 text-[#33343a]">{excerpt}{excerpt.length >= 105 ? '...' : ''}</p>
                            <div className="mt-5 flex items-center justify-between text-xs text-[#55565c]">
                              <span>◎ {formatCount(post.viewCount || 0)}</span>
                              <span>♡ {formatCount(post.likes?.length || 0)}</span>
                              <span>○ {post.commentCount || 0}</span>
                              <span>⌑</span>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {totalPages > 1 && (
                  <nav className="mt-7 flex flex-col gap-3 border-t border-[#101116]/12 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="btn-soft disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      ← Previous
                    </button>
                    <span className="text-[#55565c]">Page {page} of {totalPages} ({totalPosts} posts)</span>
                    <button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="btn-soft disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Next →
                    </button>
                  </nav>
                )}
              </section>
            </section>

            <aside className="space-y-5">
              <section className="panel p-5">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-black">Write a new post</h3>
                  <span className="text-xs text-[#77787d]">Saved as draft</span>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-bold">Title</label>
                  <input className="field" readOnly value="The Future of Developer Experience" />
                  <label className="block text-xs font-bold">Slug</label>
                  <input className="field" readOnly value="the-future-of-developer-experience" />
                  <label className="block text-xs font-bold">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {['Developer Experience', 'Productivity', 'Tech'].map((tag) => (
                      <span key={tag} className="rounded-[5px] border border-[#2932ff]/25 bg-[#2932ff]/7 px-2 py-1 text-xs font-semibold text-[#2027c9]">{tag} ×</span>
                    ))}
                    <span className="grid h-8 w-8 place-items-center rounded-[5px] border border-[#101116]/12 text-lg">+</span>
                  </div>
                  <Link to="/write" className="btn-primary mt-3 w-full">Continue Writing <span>→</span></Link>
                </div>
              </section>

              <section className="rounded-[8px] bg-[#12151a] p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-black">Dashboard</h3>
                  <span className="rounded-[5px] border border-white/15 px-3 py-1 text-xs">May 12 - May 18, 2025</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    ['Total Posts', totalPosts || visiblePosts.length, '12%'],
                    ['Total Views', formatCount(totalViews), '28%'],
                    ['Total Likes', formatCount(totalLikes), '18%'],
                    ['Comments', totalComments, '9%']
                  ].map(([label, value, delta]) => (
                    <div key={label} className="rounded-[6px] bg-white/[0.055] p-3">
                      <p className="text-[10px] text-white/68">{label}</p>
                      <p className="mt-2 text-2xl font-black">{value}</p>
                      <p className="mt-1 text-xs text-[#74f088]">↑ {delta}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-[6px] border border-white/10 bg-white/[0.035] p-4">
                  <p className="mb-3 text-sm font-bold">Views Overview</p>
                  <div className="chart-line" aria-hidden="true">
                    {[44, 58, 30, 52, 72, 42, 80].map((height, index) => (
                      <span key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-black">Recent Comments</h3>
                  <Link to="/dashboard" className="text-sm font-bold text-[#2932ff]">View all →</Link>
                </div>
                <div className="space-y-4">
                  {[
                    ['Ananya Sharma', 'Beautifully written. The clarity in the examples makes complex ideas feel simple.', '12'],
                    ['Ravi Ranjan', 'Thanks so much, Ananya! Glad it helped.', '5']
                  ].map(([name, body, likes], index) => (
                    <div key={name} className={index ? 'rounded-[6px] bg-[#101116]/4 p-3' : ''}>
                      <div className="flex gap-3">
                        <AuthorAvatar author={{ name }} />
                        <div>
                          <p className="text-sm font-black">{name} <span className="text-xs font-medium text-[#77787d]">{index ? '1h ago' : '2h ago'}</span></p>
                          <p className="mt-1 text-sm leading-5 text-[#33343a]">{body}</p>
                          <p className="mt-2 text-xs font-bold">Reply <span className="ml-3">♡ {likes}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-3">
                  <AuthorAvatar author={featured.author} />
                  <input className="field" placeholder="Write a comment..." />
                  <button className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] bg-[#2932ff] text-white">›</button>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>

      <section className="mx-auto mt-4 grid max-w-[1780px] gap-px overflow-hidden rounded-[8px] border border-[#101116]/10 bg-[#101116]/10 md:grid-cols-3 xl:grid-cols-6">
        {['Debounced Views', 'Drafts and Publishing', 'Optimistic UI', 'Uploads Fallback', 'JWT Auth', 'Search and Filters'].map((item) => (
          <div key={item} className="bg-[#fffefb] px-7 py-4">
            <p className="text-sm font-black">{item}</p>
            <p className="mt-1 text-xs text-[#55565c]">Built into the live MERN workflow</p>
          </div>
        ))}
      </section>

      <footer className="mx-auto mt-4 flex max-w-[1780px] flex-col gap-4 rounded-[8px] bg-[#101116] px-8 py-5 text-white md:flex-row md:items-center md:justify-between">
        <Link to="/" className="brand-mark text-2xl font-semibold">Authoryn <span>✦</span></Link>
        <p className="text-sm text-white/68">© 2025 Authoryn. All rights reserved.</p>
        <p className="editorial-serif text-lg italic">The best ideas rise above.</p>
      </footer>
    </div>
  );
};

export default Home;

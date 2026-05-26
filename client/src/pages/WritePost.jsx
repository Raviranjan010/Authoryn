import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import PostEditor from '../components/PostEditor';
import toast from 'react-hot-toast';
import { FiEye, FiEdit3, FiArrowLeft, FiSave } from 'react-icons/fi';

export const WritePost = () => {
  const { createPost, loading, error: apiError } = usePosts();
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState(() => localStorage.getItem('draft_title') || '');
  const [content, setContent] = useState(() => localStorage.getItem('draft_content') || '');
  const [category, setCategory] = useState(() => localStorage.getItem('draft_category') || 'Development');
  const [tags, setTags] = useState(() => localStorage.getItem('draft_tags') || '');
  const [status, setStatus] = useState('draft');
  const [sendNewsletter, setSendNewsletter] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  // Tab state: 'edit' or 'preview'
  const [activeTab, setActiveTab] = useState('edit');

  // Local Autosave Effect
  useEffect(() => {
    localStorage.setItem('draft_title', title);
    localStorage.setItem('draft_content', content);
    localStorage.setItem('draft_category', category);
    localStorage.setItem('draft_tags', tags);
  }, [title, content, category, tags]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      // Create preview URL
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem('draft_title');
    localStorage.removeItem('draft_content');
    localStorage.removeItem('draft_category');
    localStorage.removeItem('draft_tags');
    setTitle('');
    setContent('');
    setCategory('Development');
    setTags('');
    setImagePreview('');
    setCoverFile(null);
    toast.success('Draft cleared');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and some content.');
      toast.error('Title and content are required');
      return;
    }

    setError('');

    // Prepare Multipart FormData
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content);
    formData.append('category', category);
    formData.append('tags', tags.trim());
    formData.append('status', status);
    formData.append('sendNewsletter', sendNewsletter);
    
    // File upload field required by Express route is 'coverImage'
    if (coverFile) {
      formData.append('coverImage', coverFile);
    }

    try {
      const created = await createPost(formData);
      if (created) {
        // Clear drafts from storage
        localStorage.removeItem('draft_title');
        localStorage.removeItem('draft_content');
        localStorage.removeItem('draft_category');
        localStorage.removeItem('draft_tags');
        toast.success(status === 'published' ? 'Article published successfully!' : 'Draft saved successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(apiError || 'Failed to create post. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 px-6 font-sans">
      <div className="max-w-[800px] mx-auto">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center pb-6 border-b border-border-light mb-8 text-left">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-serif text-text-primary">Create Story</h1>
            <p className="text-sm text-text-secondary font-light">Draft or publish a new editorial entry.</p>
          </div>
          <Link to="/dashboard" className="btn-outline flex items-center space-x-1.5 text-xs px-4 py-2 font-bold">
            <FiArrowLeft />
            <span>Workspace</span>
          </Link>
        </div>

        {/* Form panel tab switcher */}
        <div className="flex justify-between items-center bg-white border border-border-light rounded-xl p-3 mb-6 shadow-sm">
          <div className="flex space-x-2 bg-background p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'edit' ? 'bg-white text-accent-green shadow-sm' : 'text-text-secondary'}`}
            >
              <FiEdit3 />
              <span>Write Story</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'preview' ? 'bg-white text-accent-green shadow-sm' : 'text-text-secondary'}`}
            >
              <FiEye />
              <span>Live Preview</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-text-secondary font-semibold font-mono">
            <FiSave className="text-accent-green animate-pulse" />
            <button onClick={handleClearDraft} className="hover:text-red-600 transition-colors cursor-pointer">Clear Draft</button>
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="mb-6 p-4 border border-red-600/30 bg-red-600/5 text-red-600 text-sm font-semibold rounded-xl text-left">
            {error}
          </div>
        )}

        {activeTab === 'edit' ? (
          /* WRITE MODE FORM */
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Title */}
            <div className="space-y-1">
              <label htmlFor="post-title" className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Article Title
              </label>
              <input
                id="post-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling title..."
                className="w-full px-4 py-3 bg-white border border-border-light rounded-xl focus:outline-none focus:border-accent-green text-xl font-serif leading-snug font-bold placeholder-text-secondary/40 shadow-sm"
                required
              />
            </div>

            {/* Category selector */}
            <div className="space-y-1">
              <label htmlFor="post-category" className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Category
              </label>
              <select
                id="post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white border border-border-light focus:border-accent-green rounded-xl py-3 px-4 text-sm font-medium focus:outline-none text-text-primary cursor-pointer w-full shadow-sm"
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Culture">Culture</option>
              </select>
            </div>

            {/* Cover image upload */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Cover Image
              </span>
              <div className="flex flex-col space-y-3 bg-white border border-border-light rounded-xl p-5 shadow-sm">
                <label className="w-full sm:w-auto btn-outline text-center text-xs py-2.5 px-5 cursor-pointer self-start font-bold">
                  <span>Choose Cover File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {coverFile && (
                  <span className="text-xs text-text-secondary font-mono">{coverFile.name} ({Math.round(coverFile.size / 1024)} KB)</span>
                )}
                {imagePreview && (
                  <div className="w-full h-48 overflow-hidden rounded-lg border border-border-light">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Post editor */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1">
                Body Content
              </label>
              <PostEditor value={content} onChange={setContent} />
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label htmlFor="post-tags" className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Tags (Comma separated)
              </label>
              <input
                id="post-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="technology, design, culture"
                className="w-full px-4 py-3 bg-white border border-border-light rounded-xl focus:outline-none focus:border-accent-green text-sm font-light placeholder-text-secondary/40 shadow-sm"
              />
              <p className="text-[10px] text-text-secondary italic font-light">
                Enter keywords separated by commas (e.g. "culture, design").
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-border-light">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <label htmlFor="post-status" className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Publication Status
                  </label>
                  <select
                    id="post-status"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      if (e.target.value !== 'published') {
                        setSendNewsletter(false);
                      }
                    }}
                    className="bg-white border border-border-light focus:border-accent-green rounded-full py-1.5 px-4 text-xs font-bold focus:outline-none text-text-primary cursor-pointer shadow-sm"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Article</option>
                  </select>
                </div>

                {status === 'published' && (
                  <label className="flex items-center space-x-2 text-xs font-semibold text-text-primary cursor-pointer bg-white px-4 py-1.5 border border-border-light rounded-full shadow-sm">
                    <input
                      type="checkbox"
                      checked={sendNewsletter}
                      onChange={(e) => setSendNewsletter(e.target.checked)}
                      className="accent-green cursor-pointer"
                    />
                    <span>Send to Subscribers</span>
                  </label>
                )}
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Link to="/dashboard" className="w-1/2 sm:w-auto btn-outline text-center text-xs py-2.5 px-5 font-bold">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 sm:w-auto btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider flex justify-center items-center shadow-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    status === 'published' ? 'Publish Story' : 'Save Draft'
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* LIVE PREVIEW MODE */
          <div className="bg-white border border-border-light rounded-2xl p-8 shadow-premium text-left space-y-6">
            <div className="space-y-4">
              <span className="bg-accent-green text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md">
                {category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight text-text-primary">
                {title || 'Story Title Placeholder'}
              </h1>
              <div className="text-xs text-text-secondary font-medium">
                By you • Just now
              </div>
            </div>

            {/* Preview image */}
            {imagePreview ? (
              <div className="w-full h-[320px] overflow-hidden rounded-xl border border-border-light shadow-sm">
                <img src={imagePreview} alt="Preview cover" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-[180px] bg-background border border-dashed border-border-light rounded-xl flex items-center justify-center text-xs text-text-secondary italic">
                No cover image uploaded
              </div>
            )}

            {/* Preview text */}
            {content ? (
              <div 
                className="post-content-body text-[17px] leading-[1.85] text-text-primary font-serif font-light space-y-6 break-words border-t border-border-light/60 pt-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-sm text-text-secondary italic font-light py-8 text-center border-t border-border-light/60">
                Write some content in the editor to see it rendered here.
              </p>
            )}

            {/* Preview Tags */}
            {tags.trim() && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-border-light/40">
                {tags.split(',').map((tag) => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-accent-green bg-soft-accent/30 px-2.5 py-1 rounded-md">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WritePost;

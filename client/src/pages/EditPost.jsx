import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePosts from '../hooks/usePosts';
import PostEditor from '../components/PostEditor';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { FiEye, FiEdit3, FiArrowLeft } from 'react-icons/fi';

export const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { updatePost, loading, error: apiError } = usePosts();
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Development');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [sendNewsletter, setSendNewsletter] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [existingCoverImage, setExistingCoverImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Tab state: 'edit' or 'preview'
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await api.get(`/api/posts/${id}`);
        if (response.data.success) {
          const post = response.data.post;
          
          // Verify Ownership
          if (post.author?._id !== user?._id && user?.role !== 'admin') {
            setError('You are not authorized to edit this story.');
            toast.error('Unauthorized access');
            setFetching(false);
            return;
          }

          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category || 'Development');
          setTags(post.tags ? post.tags.join(', ') : '');
          setStatus(post.status);
          setExistingCoverImage(post.thumbnail || '');
        }
      } catch (err) {
        console.error(err);
        setError('Could not retrieve post details.');
        toast.error('Failed to load story');
      } finally {
        setFetching(false);
      }
    };

    if (user) {
      fetchPostDetails();
    }
  }, [id, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and some content.');
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
    
    // File upload field expected by Express router is 'coverImage'
    if (coverFile) {
      formData.append('coverImage', coverFile);
    }

    try {
      const updated = await updatePost(id, formData);
      if (updated) {
        toast.success('Story updated successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(apiError || 'Failed to update post. Please try again.');
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-sans">
        <div className="text-center font-light">
          <div className="w-8 h-8 border-4 border-soft-accent border-t-accent-green rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-xs text-text-secondary font-semibold animate-pulse">Retrieving post details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 font-sans text-center">
        <h2 className="text-2xl font-bold font-serif text-text-primary mb-2">Access Denied</h2>
        <p className="text-sm text-text-secondary font-light mb-6">{error}</p>
        <Link to="/dashboard" className="btn-outline text-xs px-6 py-2.5 rounded-full font-bold">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentCoverUrl = imagePreview 
    ? imagePreview 
    : (existingCoverImage 
        ? (existingCoverImage.startsWith('/') ? `http://localhost:5000${existingCoverImage}` : existingCoverImage)
        : '');

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 px-6 font-sans">
      <div className="max-w-[800px] mx-auto">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center pb-6 border-b border-border-light mb-8 text-left">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-serif text-text-primary">Edit Story</h1>
            <p className="text-sm text-text-secondary font-light">Modify your written draft or publication details.</p>
          </div>
          <Link to="/dashboard" className="btn-outline flex items-center space-x-1.5 text-xs px-4 py-2 font-bold">
            <FiArrowLeft />
            <span>Workspace</span>
          </Link>
        </div>

        {/* Form panel tab switcher */}
        <div className="flex bg-white border border-border-light rounded-xl p-3 mb-6 shadow-sm justify-between items-center">
          <div className="flex space-x-2 bg-background p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'edit' ? 'bg-white text-accent-green shadow-sm' : 'text-text-secondary'}`}
            >
              <FiEdit3 />
              <span>Edit Content</span>
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
        </div>

        {/* Errors */}
        {(error || apiError) && (
          <div className="mb-6 p-4 border border-red-600/30 bg-red-600/5 text-red-600 text-sm font-semibold rounded-xl text-left">
            {error || apiError}
          </div>
        )}

        {activeTab === 'edit' ? (
          /* EDIT MODE FORM */
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
                  <span>Change Cover File</span>
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
                {currentCoverUrl && (
                  <div className="w-full h-48 overflow-hidden rounded-lg border border-border-light">
                    <img
                      src={currentCoverUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Post content editor */}
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
                    'Save Changes'
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
            {currentCoverUrl ? (
              <div className="w-full h-[320px] overflow-hidden rounded-xl border border-border-light shadow-sm">
                <img src={currentCoverUrl} alt="Preview cover" className="w-full h-full object-cover" />
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

export default EditPost;

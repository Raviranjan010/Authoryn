import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import PostEditor from '../components/PostEditor';

export const WritePost = () => {
  const { createPost, loading, error: apiError } = usePosts();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      // Create preview URL
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Please provide both a title and some body content.');
      return;
    }

    setError('');

    // Prepare Multipart FormData
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('body', body);
    formData.append('tags', tags.trim());
    formData.append('status', status);
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    try {
      const created = await createPost(formData);
      if (created) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(apiError || 'Failed to create post. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] pt-24 pb-20 px-6 font-sans">
      <div className="max-w-[720px] mx-auto">
        <div className="flex justify-between items-center pb-6 border-b border-[#111111]/15 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#111111]">Write Story</h1>
            <p className="text-xs text-[#666666] font-light">Draft or publish a new editorial entry.</p>
          </div>
          <Link to="/dashboard" className="btn-outline text-xs px-3.5 py-1.5">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Errors */}
        {(error || apiError) && (
          <div className="mb-6 p-4 border border-red-600/30 bg-red-600/5 text-red-600 text-sm font-semibold rounded-[4px]">
            {error || apiError}
          </div>
        )}

        {/* Write Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Title */}
          <div className="space-y-1">
            <label htmlFor="post-title" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Article Title
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a compelling title..."
              className="w-full px-4 py-3 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-xl font-serif leading-snug font-medium placeholder-[#666666]/40"
              required
            />
          </div>

          {/* Cover Image Upload & Preview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Cover Image
            </span>
            <div className="flex flex-col space-y-3">
              <label className="w-full sm:w-auto btn-outline text-center text-xs py-2 px-4 cursor-pointer self-start">
                <span>Select Cover File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {coverImage && (
                <span className="text-xs text-[#666666] font-mono">{coverImage.name} ({Math.round(coverImage.size / 1024)} KB)</span>
              )}
              {imagePreview && (
                <div className="w-full h-48 overflow-hidden border border-[#111111]/20 rounded-[4px]">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Post Body (Rich Text Editor) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#111111] block mb-1">
              Body Content
            </label>
            <PostEditor value={body} onChange={setBody} />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label htmlFor="post-tags" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Tags (Comma separated)
            </label>
            <input
              id="post-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="technology, design, culture"
              className="w-full px-4 py-3 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-sm font-light placeholder-[#666666]/40"
            />
            <p className="text-[10px] text-[#666666] italic font-light font-sans">
              Enter keywords separated by commas (e.g. "culture, design").
            </p>
          </div>

          {/* Status & Save Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-[#111111]/10">
            {/* Status Selector */}
            <div className="flex items-center space-x-3">
              <label htmlFor="post-status" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                Status
              </label>
              <select
                id="post-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-transparent border border-[#111111]/30 focus:border-[#5B4FE8] rounded-[4px] py-1.5 px-3 text-xs font-medium focus:outline-none text-[#111111] cursor-pointer"
              >
                <option value="draft">Save as Draft</option>
                <option value="published">Publish Article</option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Link to="/dashboard" className="w-1/2 sm:w-auto btn-outline text-center text-xs py-2 px-4">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 sm:w-auto btn-accent py-2 px-5 text-xs font-semibold uppercase tracking-wider flex justify-center items-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-t-2 border-r-2 border-[#F7F5F0] rounded-full animate-spin"></div>
                ) : (
                  'Save Story'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WritePost;

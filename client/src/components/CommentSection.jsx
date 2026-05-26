import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';
import { formatRelativeTime } from '../utils/formatDate';

export const CommentSection = ({ postId, onCommentCountChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');

  // Fetch comments on mount/post change
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/api/comments/${postId}`);
        if (response.data.success) {
          setComments(response.data.comments);
          if (onCommentCountChange) {
            onCommentCountChange(response.data.comments.length);
          }
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitError('');

    // Prepare optimistic comment
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      body: body.trim(),
      createdAt: new Date().toISOString(),
      author: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      },
      isPending: true
    };

    // Store current state for rollback
    const previousComments = [...comments];

    // Optimistic Update
    const newComments = [optimisticComment, ...comments];
    setComments(newComments);
    if (onCommentCountChange) {
      onCommentCountChange(newComments.length);
    }
    const currentBody = body;
    setBody('');

    try {
      const response = await api.post(`/api/comments/${postId}`, { body: currentBody });
      if (response.data.success) {
        // Replace temp comment with actual comment from backend
        setComments((prev) =>
          prev.map((c) => (c._id === optimisticComment._id ? response.data.comment : c))
        );
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      setSubmitError(err.response?.data?.error || 'Failed to submit comment. Please try again.');
      // Rollback
      setComments(previousComments);
      setBody(currentBody);
      if (onCommentCountChange) {
        onCommentCountChange(previousComments.length);
      }
    }
  };

  const handleDelete = async (commentId) => {
    // Store current state for rollback
    const previousComments = [...comments];

    // Optimistic Update (remove instantly)
    const newComments = comments.filter((c) => c._id !== commentId);
    setComments(newComments);
    if (onCommentCountChange) {
      onCommentCountChange(newComments.length);
    }

    try {
      await api.delete(`/api/comments/${commentId}`);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      // Rollback on failure
      setComments(previousComments);
      if (onCommentCountChange) {
        onCommentCountChange(previousComments.length);
      }
    }
  };

  return (
    <section id="comments" className="mt-12 pt-8 border-t border-[#111111]/15 font-sans">
      <h3 className="text-xl font-semibold font-serif text-[#111111] mb-6">
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 space-y-3">
          <div>
            <label htmlFor="comment-body" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="comment-body"
              rows="4"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Join the conversation..."
              className="w-full px-4 py-3 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-[15px] resize-y placeholder-[#666666]/60 font-light leading-relaxed"
              required
            ></textarea>
          </div>
          {submitError && <p className="text-xs text-red-600 font-medium">{submitError}</p>}
          <div className="flex justify-end">
            <button type="submit" className="btn-accent px-5 py-2 text-xs">
              Publish Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#111111]/5 border border-[#111111]/10 rounded-[4px] p-6 text-center mb-8">
          <p className="text-sm text-[#666666] mb-3">You must be logged in to leave a comment.</p>
          <Link to="/login" className="btn-outline text-xs px-4 py-2">
            Log In to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-4 text-sm text-[#666666] font-light">Loading comments...</div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[#666666] italic font-light py-4">No comments yet. Be the first to write one.</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className={`pb-6 border-b border-[#111111]/5 last:border-0 flex items-start space-x-4 transition-opacity duration-150 ${
                comment.isPending ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* Commenter Avatar */}
              {comment.author?.avatar ? (
                <img
                  src={comment.author.avatar.startsWith('/') ? `http://localhost:5000${comment.author.avatar}` : comment.author.avatar}
                  alt={comment.author.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#111111]/20 mt-1"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-xs font-bold uppercase mt-1">
                  {comment.author?.name ? comment.author.name.charAt(0) : 'U'}
                </div>
              )}

              {/* Comment Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-[#111111]">
                      {comment.author?.name}
                    </span>
                    <span className="text-xs text-[#666666]/70">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  
                  {/* Delete Option (only comment owner or admin) */}
                  {user && (user._id === comment.author?._id || user.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-xs text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider font-semibold cursor-pointer"
                      title="Delete comment"
                      disabled={comment.isPending}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-[14px] leading-relaxed text-[#111111] font-light break-words whitespace-pre-line">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentSection;

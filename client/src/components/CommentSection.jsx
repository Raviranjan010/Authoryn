import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';
import { formatRelativeTime } from '../utils/formatDate';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';

export const CommentSection = ({ postId, onCommentCountChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
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
    if (!text.trim()) return;

    setSubmitError('');

    // Prepare optimistic comment
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      user: {
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
    const currentText = text;
    setText('');

    try {
      const response = await api.post(`/api/comments/${postId}`, { text: currentText });
      if (response.data.success) {
        // Replace temp comment with actual comment from backend
        setComments((prev) =>
          prev.map((c) => (c._id === optimisticComment._id ? response.data.comment : c))
        );
        toast.success('Comment posted!');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      setSubmitError(err.response?.data?.error || 'Failed to submit comment. Please try again.');
      // Rollback
      setComments(previousComments);
      setText(currentText);
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
      toast.success('Comment deleted');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error('Failed to delete comment');
      // Rollback on failure
      setComments(previousComments);
      if (onCommentCountChange) {
        onCommentCountChange(previousComments.length);
      }
    }
  };

  return (
    <section id="comments" className="mt-12 pt-8 border-t border-border-light font-sans">
      <h3 className="text-xl font-bold font-serif text-text-primary mb-6">
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
              rows="3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Join the conversation..."
              className="w-full px-4 py-3 bg-white border border-border-light rounded-xl focus:outline-none focus:border-accent-green text-[14px] resize-y placeholder-text-secondary/50 font-light leading-relaxed shadow-sm"
              required
            ></textarea>
          </div>
          {submitError && <p className="text-xs text-red-600 font-medium">{submitError}</p>}
          <div className="flex justify-end">
            <button type="submit" className="btn-primary text-xs px-5 py-2 cursor-pointer shadow-sm">
              Publish Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white border border-border-light rounded-xl p-6 text-center mb-8 shadow-sm">
          <p className="text-sm text-text-secondary mb-3 font-medium">You must be logged in to leave a comment.</p>
          <Link to="/login" className="btn-outline text-xs px-4 py-2 cursor-pointer">
            Log In to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-4 text-sm text-text-secondary font-light">Loading comments...</div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-text-secondary italic font-light py-4">No comments yet. Be the first to write one.</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className={`pb-6 border-b border-border-light/40 last:border-0 flex items-start space-x-4 transition-opacity duration-150 ${
                comment.isPending ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* Commenter Avatar */}
              {comment.user?.avatar ? (
                <img
                  src={getImageUrl(comment.user.avatar)}
                  alt={comment.user.name}
                  className="w-9 h-9 rounded-full object-cover border border-border-light mt-1"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent-green text-white flex items-center justify-center text-xs font-bold uppercase mt-1">
                  {comment.user?.name ? comment.user.name.charAt(0) : 'U'}
                </div>
              )}

              {/* Comment Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-text-primary">
                      {comment.user?.name}
                    </span>
                    <span className="text-xs text-text-secondary font-light">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  
                  {/* Delete Option (only comment owner or admin) */}
                  {user && (user._id === comment.user?._id || user.role === 'admin') && (
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
                <p className="text-[14px] leading-relaxed text-text-primary font-light break-words whitespace-pre-line">
                  {comment.text}
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

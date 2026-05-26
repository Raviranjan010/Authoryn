import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axiosInstance';

export const LikeButton = ({ postId, initialLikes = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (user && likes) {
      setIsLiked(likes.includes(user._id));
    } else {
      setIsLiked(false);
    }
  }, [likes, user]);

  const handleLike = async () => {
    if (!user) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }

    // Trigger pop animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Save previous state for rollback
    const previousLikes = [...likes];
    const previouslyLiked = isLiked;

    // Optimistic Update
    let newLikes = [...likes];
    if (previouslyLiked) {
      newLikes = newLikes.filter((id) => id !== user._id);
      setIsLiked(false);
    } else {
      newLikes.push(user._id);
      setIsLiked(true);
    }
    setLikes(newLikes);

    try {
      const response = await api.post(`/api/posts/${postId}/like`);
      if (response.data.success) {
        // Confirm backend values
        setLikes(response.data.likes);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Rollback on error
      setLikes(previousLikes);
      setIsLiked(previouslyLiked);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center space-x-2 px-3 py-1.5 border border-[#111111]/20 hover:border-[#111111]/60 rounded-[4px] bg-transparent text-xs font-sans transition-all duration-200 cursor-pointer ${
        isLiked ? 'text-[#5B4FE8] border-[#5B4FE8]/40' : 'text-[#666666]'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className={`w-4.5 h-4.5 transition-transform duration-200 ${
          isLiked ? 'fill-current stroke-[#5B4FE8]' : 'fill-none'
        } ${isAnimating ? 'scale-150 text-[#5B4FE8]' : 'scale-100'}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span className="font-semibold">{likes.length}</span>
    </button>
  );
};

export default LikeButton;

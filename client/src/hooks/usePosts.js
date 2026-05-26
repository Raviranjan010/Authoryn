import { useState } from 'react';
import api from '../api/axiosInstance';

export const usePosts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPosts = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/posts', { params });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPostBySlug = async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/posts/${slug}`);
      return response.data.post;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserPosts = async (username) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/posts/user/${username}`);
      return response.data.posts;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.post;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/api/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.post;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/api/posts/${id}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (id) => {
    try {
      const response = await api.post(`/api/posts/${id}/like`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  return {
    loading,
    error,
    getPosts,
    getPostBySlug,
    getUserPosts,
    createPost,
    updatePost,
    deletePost,
    toggleLike
  };
};

export default usePosts;

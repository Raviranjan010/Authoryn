import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axiosInstance';

export const Settings = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setAvatarSuccess('');
      setAvatarError('');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      setProfileError('Name and Username are required.');
      return;
    }

    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const response = await api.put('/api/users/me', {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim()
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setProfileSuccess('Profile details updated successfully.');
      }
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;

    setAvatarError('');
    setAvatarSuccess('');
    setAvatarLoading(true);

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const response = await api.post('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setAvatarSuccess('Avatar uploaded successfully.');
        setAvatarFile(null);
      }
    } catch (err) {
      console.error(err);
      setAvatarError(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const currentAvatarUrl = avatarPreview
    ? avatarPreview
    : (user?.avatar
        ? (user.avatar.startsWith('/') ? `http://localhost:5000${user.avatar}` : user.avatar)
        : '');

  return (
    <div className="min-h-screen bg-[#F7F5F0] pt-24 pb-20 px-6 font-sans">
      <div className="max-w-[720px] mx-auto">
        
        {/* Editorial Header */}
        <div className="flex justify-between items-center pb-6 border-b border-[#111111]/15 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#111111]">Settings</h1>
            <p className="text-xs text-[#666666] font-light">Update your public author profile details.</p>
          </div>
          <Link to="/dashboard" className="btn-outline text-xs px-3.5 py-1.5">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Avatar Panel */}
          <div className="md:col-span-1 border border-[#111111]/10 rounded-[4px] p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111111] font-mono">Avatar Photo</h3>
            
            <form onSubmit={handleAvatarSubmit} className="space-y-4 flex flex-col items-center">
              {/* Avatar Image preview */}
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#111111]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#111111] text-[#F7F5F0] flex items-center justify-center text-3xl font-bold uppercase border-2 border-[#111111]">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
              )}

              {/* Upload Input */}
              <div className="w-full">
                <label className="block w-full btn-outline text-center text-xs py-1.5 cursor-pointer">
                  <span>Browse File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              {avatarFile && (
                <button
                  type="submit"
                  disabled={avatarLoading}
                  className="w-full btn-accent py-1.5 text-xs font-semibold uppercase tracking-wider flex justify-center items-center"
                >
                  {avatarLoading ? (
                    <div className="w-4 h-4 border-t-2 border-r-2 border-[#F7F5F0] rounded-full animate-spin"></div>
                  ) : (
                    'Upload Photo'
                  )}
                </button>
              )}

              {/* Status Feedbacks */}
              {avatarSuccess && <p className="text-[10px] text-green-700 font-semibold">{avatarSuccess}</p>}
              {avatarError && <p className="text-[10px] text-red-600 font-semibold">{avatarError}</p>}
            </form>
          </div>

          {/* Details Form (Name, Username, Bio) */}
          <div className="md:col-span-2 border border-[#111111]/10 rounded-[4px] p-6 space-y-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111111] font-mono border-b border-[#111111]/10 pb-2">Profile Details</h3>
            
            {profileSuccess && (
              <div className="p-3 border border-green-700/30 bg-green-700/5 text-green-700 text-xs font-semibold rounded-[4px]">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="p-3 border border-red-600/30 bg-red-600/5 text-red-600 text-xs font-semibold rounded-[4px]">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1">
                <label htmlFor="display-name" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-sm font-light"
                  placeholder="Your Name"
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label htmlFor="settings-username" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                  Username (slug-safe)
                </label>
                <input
                  id="settings-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-sm font-light font-mono"
                  placeholder="username"
                  required
                />
                <p className="text-[10px] text-[#666666] italic font-light">
                  Your profile URL: /author/{username || 'username'}
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label htmlFor="settings-bio" className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                  Short Biography
                </label>
                <textarea
                  id="settings-bio"
                  rows="4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength="200"
                  className="w-full px-4 py-2.5 bg-transparent border border-[#111111]/30 rounded-[4px] focus:outline-none focus:border-[#5B4FE8] text-sm font-light placeholder-[#666666]/60 leading-relaxed"
                  placeholder="Tell your readers about yourself..."
                ></textarea>
                <div className="flex justify-between items-center text-[10px] text-[#666666] font-mono">
                  <span>Max 200 characters</span>
                  <span>{bio.length}/200</span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#111111]/10">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-accent py-2 px-5 text-xs font-semibold uppercase tracking-wider flex justify-center items-center"
                >
                  {profileLoading ? (
                    <div className="w-4 h-4 border-t-2 border-r-2 border-[#F7F5F0] rounded-full animate-spin"></div>
                  ) : (
                    'Save Details'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;

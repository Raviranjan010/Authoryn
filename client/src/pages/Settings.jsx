import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUser, FiCamera, FiCheckCircle } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUrl';

export const Settings = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(false);
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
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      toast.error('Name and Username are required.');
      return;
    }

    setProfileLoading(true);

    try {
      const response = await api.put('/api/users/me', {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim()
      });

      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Profile details updated successfully.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;

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
        toast.success('Avatar uploaded successfully!');
        setAvatarFile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const currentAvatarUrl = avatarPreview
    ? avatarPreview
    : getImageUrl(user?.avatar);

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 px-6 font-sans">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Layout */}
          <div className="lg:col-span-3">
            <Sidebar />
          </div>

          {/* Right Main Content Panel */}
          <main className="lg:col-span-9 space-y-8 text-left">
            
            {/* Header info */}
            <div className="flex justify-between items-center pb-6 border-b border-border-light">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold font-serif text-text-primary">Profile Settings</h1>
                <p className="text-sm text-text-secondary font-light">Update your public author profile biography and account identifiers.</p>
              </div>
              <Link to="/dashboard" className="btn-outline flex items-center space-x-1.5 text-xs px-4 py-2 font-bold">
                <FiArrowLeft />
                <span>Workspace</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Avatar Panel (4 cols) */}
              <div className="md:col-span-4 bg-white border border-border-light rounded-xl p-6 space-y-6 shadow-premium">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono pb-2 border-b border-border-light/60">Avatar Photo</h3>
                
                <form onSubmit={handleAvatarSubmit} className="space-y-5 flex flex-col items-center">
                  {/* Avatar Image preview */}
                  <div className="relative group cursor-pointer">
                    {currentAvatarUrl ? (
                      <img
                        src={currentAvatarUrl}
                        alt="Avatar preview"
                        className="w-28 h-28 rounded-full object-cover border border-border-light shadow-sm"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-accent-green text-white flex items-center justify-center text-4xl font-bold uppercase border border-border-light shadow-sm">
                        {user?.name ? user.name.charAt(0) : 'U'}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-dark-section/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                      <FiCamera className="text-white text-2xl" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Upload Label */}
                  <div className="text-center">
                    <p className="text-xs text-text-secondary font-light">Click image to choose new file</p>
                    {avatarFile && (
                      <p className="text-[10px] text-accent-green font-semibold mt-1 truncate max-w-[160px]">{avatarFile.name}</p>
                    )}
                  </div>

                  {avatarFile && (
                    <button
                      type="submit"
                      disabled={avatarLoading}
                      className="w-full btn-primary py-2 text-xs font-bold uppercase tracking-wider flex justify-center items-center shadow-sm"
                    >
                      {avatarLoading ? (
                        <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                      ) : (
                        'Save Photo'
                      )}
                    </button>
                  )}
                </form>
              </div>

              {/* Profile Details Form (8 cols) */}
              <div className="md:col-span-8 bg-white border border-border-light rounded-xl p-6 space-y-6 shadow-premium">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono pb-2 border-b border-border-light/60">Profile Details</h3>
                
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  {/* Display Name */}
                  <div className="space-y-1">
                    <label htmlFor="display-name" className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                      Display Name
                    </label>
                    <input
                      id="display-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border-light focus:border-accent-green focus:ring-1 focus:ring-accent-green/20 rounded-xl focus:outline-none text-[14px] font-medium transition-all shadow-sm"
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1">
                    <label htmlFor="settings-username" className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2.5 text-text-secondary text-[14px] font-medium font-mono">@</span>
                      <input
                        id="settings-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-background border border-border-light focus:border-accent-green focus:ring-1 focus:ring-accent-green/20 rounded-xl focus:outline-none text-[14px] font-medium transition-all shadow-sm"
                        placeholder="username"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-text-secondary italic font-light pt-1">
                      Your profile URL: /author/{username || 'username'}
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1">
                    <label htmlFor="settings-bio" className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                      Biography
                    </label>
                    <textarea
                      id="settings-bio"
                      rows="4"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength="200"
                      className="w-full px-4 py-2.5 bg-background border border-border-light focus:border-accent-green focus:ring-1 focus:ring-accent-green/20 rounded-xl focus:outline-none text-[14px] font-light placeholder-text-secondary/40 leading-relaxed shadow-sm"
                      placeholder="Tell your readers about yourself..."
                    ></textarea>
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono">
                      <span>Max 200 characters</span>
                      <span>{bio.length}/200</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4 border-t border-border-light/60">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider flex justify-center items-center shadow-sm"
                    >
                      {profileLoading ? (
                        <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                      ) : (
                        'Save Details'
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, UserIcon, LockIcon, GlobeIcon, PaletteIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.username || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await axios.put(`/api/users/${user.id}`, form);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess('');
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordSaving(false);
      return;
    }
    try {
      await axios.put(`/api/users/${user.id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || err.message || 'Failed to change password');
    }
    setPasswordSaving(false);
  };

  const fetchUser = async () => {
    if (!user) return;
    const res = await axios.get(`/api/users/${user.id}`);
    if (setUser) setUser(res.data);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setAvatarUploading(true);
    setAvatarSuccess('');
    setAvatarError('');
    const formData = new FormData();
    formData.append('avatar', e.target.files[0]);
    try {
      const res = await axios.post(`/api/users/${user.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(res.data.url);
      setAvatarSuccess('Profile picture updated!');
      console.log('Avatar upload response:', res.data);
      await fetchUser();
    } catch (err: any) {
      setAvatarError(err.response?.data?.error || err.message || 'Failed to upload avatar');
    }
    setAvatarUploading(false);
  };

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (user) {
      console.log('user.avatar_url:', user.avatar_url);
    }
  }, [user]);

  useEffect(() => {
    if (imgRef.current) {
      console.log('Avatar <img> src:', imgRef.current.src);
    }
  }, [user?.avatar_url, avatarUrl]);

  return <div className="px-4 sm:px-6 lg:px-8">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Settings
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Manage your account and application preferences
        </p>
      </div>
      <div className="mt-8">
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Profile Settings
                </h3>
              </div>
            </div>
            <form onSubmit={handleSave} className="px-4 py-5 sm:p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img
                    ref={imgRef}
                    src={user.avatar_url || avatarUrl || `${import.meta.env.VITE_UI_AVATARS_API || 'https://ui-avatars.com/api'}/?name=${encodeURIComponent(form.name)}&background=2563eb&color=fff&size=128`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-200"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={avatarUploading}
                    />
                    <span className="text-xs">Edit</span>
                  </label>
                </div>
                {avatarUploading && <span className="text-blue-600 text-sm mt-2">Uploading...</span>}
                {avatarSuccess && <span className="text-green-600 text-sm mt-2">{avatarSuccess}</span>}
                {avatarError && <span className="text-red-600 text-sm mt-2">{avatarError}</span>}
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Your name"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="you@example.com"
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4" hidden>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 hidden"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {success && <span className="text-green-600 text-sm">{success}</span>}
                {error && <span className="text-red-600 text-sm">{error}</span>}
              </div>
            </form>
          </div>
          {/* Security Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <LockIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Security
                </h3>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    disabled={passwordSaving}
                  >
                    {passwordSaving ? 'Saving...' : 'Change Password'}
                  </button>
                  {passwordSuccess && <span className="text-green-600 text-sm">{passwordSuccess}</span>}
                  {passwordError && <span className="text-red-600 text-sm">{passwordError}</span>}
                </div>
              </form>
               
            </div>
          </div>
          {/* Notifications */}
          <div className="bg-white shadow rounded-lg hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Notifications
                </h3>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {['Email notifications', 'Push notifications', 'SMS notifications'].map(item => <div key={item} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input type="checkbox" className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-700">
                        {item}
                      </label>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
          {/* Display Settings */}
          <div className="bg-white shadow rounded-lg hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <PaletteIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Display
                </h3>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Theme
                  </label>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default SettingsPage;
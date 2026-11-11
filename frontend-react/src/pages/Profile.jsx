import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserCircleIcon,
  EnvelopeIcon,
  PencilIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ArrowUpIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { documentsAPI, commentsAPI } from '../api';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const { username } = useParams(); // Get username from URL
  const { user: currentUser, isAuthenticated, updateProfile } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null); // User whose profile we're viewing
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [userQuestions, setUserQuestions] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [activeTab, setActiveTab] = useState('questions');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: ''
  });

  // Determine if viewing own profile
  const isOwnProfile = !username || (currentUser && currentUser.username === username);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [isAuthenticated, username, currentUser, navigate]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      let userToLoad;
      
      if (isOwnProfile) {
        // Viewing own profile - use current user
        userToLoad = currentUser;
      } else {
        // Viewing someone else's profile - fetch their data
        const response = await axios.get(`http://localhost:8000/api/users/${username}`);
        userToLoad = response.data;
      }

      setProfileUser(userToLoad);
      
      if (isOwnProfile) {
        setFormData({
          name: userToLoad.name || '',
          email: userToLoad.email || '',
          bio: userToLoad.bio || ''
        });
      }
      
      await loadUserContent(userToLoad.id);
    } catch (error) {
      console.error('Failed to load profile:', error);
      alert('User not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadUserContent = async (userId) => {
    try {
      // Load user's questions
      const questionsResponse = await documentsAPI.getAll({
        author_id: userId,
        limit: 50
      });
      setUserQuestions(questionsResponse.data);

      // Load user's comments (would need a dedicated endpoint in production)
      // For now, we'll leave it empty as the API doesn't have a user-specific comments endpoint
      setUserComments([]);
    } catch (error) {
      console.error('Failed to load user content:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users/me/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      
      // Reload user profile by calling updateProfile with empty data (which triggers a refresh)
      window.location.reload();
      
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert(error.message || 'Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    );
  }

  const stats = {
    questions: userQuestions.length,
    answers: userComments.length,
    reputation: userQuestions.reduce((sum, q) => sum + (q.vote_count || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative group">
                {profileUser.avatar_url ? (
                  <img
                    src={`http://localhost:8000${profileUser.avatar_url}`}
                    alt={profileUser.name || profileUser.username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-4xl">
                      {profileUser.name ? profileUser.name[0].toUpperCase() : profileUser.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Upload button overlay - only show on own profile */}
                {isOwnProfile && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-60 rounded-full cursor-pointer transition-all"
                  >
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      {uploadingAvatar ? (
                        <div className="text-white text-sm font-medium">Uploading...</div>
                      ) : (
                        <>
                          <CameraIcon className="w-8 h-8 text-white mx-auto mb-1" />
                          <div className="text-white text-xs font-medium">Change Photo</div>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* User info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileUser.name || profileUser.username}
                </h1>
                <p className="text-gray-600 mb-1">@{profileUser.username}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{profileUser.email}</span>
                  </span>
                  {profileUser.role && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                      {profileUser.role}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit button - only show on own profile */}
            {!editing && isOwnProfile && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Bio or Edit Form */}
          {editing && isOwnProfile ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: profileUser.name || '',
                      email: profileUser.email || '',
                      bio: profileUser.bio || ''
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              {profileUser.bio ? (
                <p className="text-gray-700">{profileUser.bio}</p>
              ) : (
                <p className="text-gray-400 italic">No bio yet</p>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.questions}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.answers}</div>
              <div className="text-sm text-gray-600">Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stats.reputation}</div>
              <div className="text-sm text-gray-600">Reputation</div>
            </div>
          </div>
        </div>

        {/* Activity Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab buttons */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'questions'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Questions ({stats.questions})</span>
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('answers')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'answers'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span>Answers ({stats.answers})</span>
                </span>
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {userQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You haven't asked any questions yet</p>
                    <button
                      onClick={() => navigate('/ask')}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium transition-colors"
                    >
                      Ask Your First Question
                    </button>
                  </div>
                ) : (
                  userQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Stats */}
                        <div className="flex flex-col items-center text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-1">
                            <ArrowUpIcon className="w-4 h-4" />
                            <span className="font-medium">{question.vote_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            <span>{question.comment_count || 0}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <button
                            onClick={() => navigate(`/questions/${question.id}`)}
                            className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors text-left mb-1"
                          >
                            {question.title}
                          </button>
                          
                          {question.summary && (
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {question.summary}
                            </p>
                          )}

                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            {question.category_name && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                                {question.category_name}
                              </span>
                            )}
                            <span>
                              {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'answers' && (
              <div className="text-center py-12">
                <ChatBubbleLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your answers will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

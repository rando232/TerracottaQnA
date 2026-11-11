import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const Moderation = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('comments');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && user.role !== 'moderator' && user.role !== 'super_admin') {
      setError('Access denied. Moderator privileges required.');
      setLoading(false);
      return;
    }

    loadData();
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/moderation', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setComments(response.data.recent_comments || []);
      setFlaggedContent(response.data.flagged_content || []);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/comments/${commentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete comment');
    }
  };

  const handleApproveComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/admin/comments/${commentId}/approve`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to approve comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Content Moderation</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comments'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Comments ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('flagged')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'flagged'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Flagged Content ({flaggedContent.length})
            </button>
          </nav>
        </div>

        {/* Recent Comments */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                No recent comments to review
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <ChatBubbleLeftIcon className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {comment.author_name || comment.author_username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveComment(comment.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Approve"
                      >
                        <CheckCircleIcon className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <XCircleIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  <p className="text-sm text-gray-500">
                    On: <a href={`/questions/${comment.document_id}`} className="text-primary-600 hover:underline">
                      Question #{comment.document_id}
                    </a>
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Flagged Content */}
        {activeTab === 'flagged' && (
          <div className="space-y-4">
            {flaggedContent.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                No flagged content
              </div>
            ) : (
              flaggedContent.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <FlagIcon className="w-6 h-6 text-red-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{item.title || 'Flagged Content'}</p>
                        <p className="text-sm text-gray-500">Flagged by multiple users</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                        Dismiss
                      </button>
                      <button className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Moderation Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Moderation Guidelines</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Review all comments for spam, offensive content, or policy violations</li>
            <li>• Handle flagged reports within 24 hours</li>
            <li>• Document moderation actions for transparency</li>
            <li>• Be consistent and fair in content decisions</li>
            <li>• Escalate complex cases to Super Admin</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Moderation;

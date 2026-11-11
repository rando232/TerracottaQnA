import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderIcon,
  TagIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const ContentManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && user.role !== 'content_manager' && user.role !== 'super_admin') {
      setError('Access denied. Content Manager privileges required.');
      setLoading(false);
      return;
    }

    loadData();
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [categoriesRes, tagsRes, documentsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/categories'),
        axios.get('http://localhost:8000/api/tags'),
        axios.get('http://localhost:8000/api/admin/content', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      setDocuments(documentsRes.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/categories', newCategory, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNewCategory({ name: '', description: '' });
      setShowCategoryForm(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create category');
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/tags', { name: newTag }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNewTag('');
      setShowTagForm(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create tag');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/documents/${docId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete document');
    }
  };

  const handleTogglePublish = async (docId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/admin/content/${docId}/status`,
        { published: !currentStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update status');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Content Management</h1>

        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FolderIcon className="w-6 h-6 mr-2" />
              Categories ({categories.length})
            </h2>
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              Add Category
            </button>
          </div>

          {showCategoryForm && (
            <form onSubmit={handleCreateCategory} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg mb-2"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg mb-2"
              />
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                Create Category
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-600">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <TagIcon className="w-6 h-6 mr-2" />
              Tags ({tags.length})
            </h2>
            <button
              onClick={() => setShowTagForm(!showTagForm)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              Add Tag
            </button>
          </div>

          {showTagForm && (
            <form onSubmit={handleCreateTag} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Tag name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-2"
                required
              />
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                Create Tag
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Documents ({documents.length})</h2>
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                  <p className="text-sm text-gray-600">by {doc.author_name || doc.author_username}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePublish(doc.id, doc.published)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      doc.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {doc.published ? 'Published' : 'Unpublished'}
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;

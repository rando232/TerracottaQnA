import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FolderIcon,
  TagIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const ContentManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchLogs, setSearchLogs] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [error, setError] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tag: '',
    dateFrom: '',
    dateTo: ''
  });

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
      const [categoriesRes, tagsRes, documentsRes, analyticsRes, searchLogsRes, categoryStatsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/categories'),
        axios.get('http://localhost:8000/api/tags'),
        axios.get('http://localhost:8000/api/admin/content', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/admin/content/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/admin/content/search-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/admin/content/category-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      // Map status field to published boolean for display
      const documentsWithPublished = documentsRes.data.map(doc => ({
        ...doc,
        published: doc.status === 'published'
      }));
      setDocuments(documentsWithPublished);
      setAnalytics(analyticsRes.data);
      setSearchLogs(searchLogsRes.data);
      setCategoryStats(categoryStatsRes.data);
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

  const exportSearchLogs = (format) => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:8000/api/admin/content/search-logs/export?format=${format}&token=${token}`, '_blank');
  };

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    // Search filter (title and content)
    if (filters.search && !doc.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.category && doc.category_id !== parseInt(filters.category)) {
      return false;
    }
    
    // Tag filter (assuming doc has tags field)
    if (filters.tag && !doc.tags?.includes(filters.tag)) {
      return false;
    }
    
    // Date range filter
    if (filters.dateFrom && new Date(doc.created_at) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(doc.created_at) > new Date(filters.dateTo)) {
      return false;
    }
    
    return true;
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      tag: '',
      dateFrom: '',
      dateTo: ''
    });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Content Management Dashboard</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics Overview
            </button>
            <button
              onClick={() => setActiveTab('taxonomy')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'taxonomy'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories & Tags
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Search & Click Logs
            </button>
          </nav>
        </div>

        {/* Analytics Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Corpus Views</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.total_views?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Across {analytics.total_documents} indexed Q&A records</p>
                  </div>
                  <EyeIcon className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Search & Click Log Rows</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.search_count || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Click-Through Rate (CTR): {analytics.ctr || '0%'}</p>
                  </div>
                  <MagnifyingGlassIcon className="w-12 h-12 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phase 2 Vocabulary Size</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.vocabulary_size?.toLocaleString() || 0} <span className="text-lg">terms</span></p>
                    <p className="text-xs text-gray-500 mt-1">Avg Doc Length (avgdl): {analytics.avg_doc_length || 0} tokens</p>
                  </div>
                  <ChartBarIcon className="w-12 h-12 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">SEO Metadata Coverage</p>
                    <p className="text-3xl font-bold text-green-600">{analytics.seo_coverage || '0%'}</p>
                    <p className="text-xs text-gray-500 mt-1">Title, Description, Alt Text & Keywords</p>
                  </div>
                  <ChartBarIcon className="w-12 h-12 text-green-600" />
                </div>
              </div>
            </div>

            {/* Category Traffic & Document Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Category Traffic & Document Distribution</h2>
              <div className="space-y-3">
                {categoryStats.map((cat) => (
                  <div key={cat.id} className="flex items-center">
                    <div className="w-48 text-sm font-medium text-gray-700">{cat.name} ({cat.doc_count} docs)</div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                          <div
                            className="bg-orange-500 h-4 rounded-full"
                            style={{ width: `${cat.percentage || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 w-32">
                          {cat.views?.toLocaleString() || 0} views ({cat.percentage}%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories & Tags Tab */}
        {activeTab === 'taxonomy' && (
          <div>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Documents ({filteredDocuments.length} of {documents.length})</h2>
            
            {/* Filters Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search Box */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                  <select
                    value={filters.tag}
                    onChange={(e) => handleFilterChange('tag', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Tags</option>
                    {tags.map(tag => (
                      <option key={tag.id} value={tag.name}>{tag.name}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No documents match your filters
                </div>
              ) : (
                filteredDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <Link to={`/questions/${doc.id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                        {doc.title}
                      </Link>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>by {doc.author_name || doc.author_username}</span>
                        <span>•</span>
                        <span>{doc.views_count || 0} views</span>
                        <span>•</span>
                        <span>{doc.comment_count || 0} answers</span>
                        {doc.category_name && (
                          <>
                            <span>•</span>
                            <span className="text-purple-600">{doc.category_name}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-gray-500">{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePublish(doc.id, doc.published)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          doc.published
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {doc.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Search & Click Logs Tab */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Live search_click_logs Table ({searchLogs.length} Records)
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => exportSearchLogs('csv')}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-1" />
                  Export CSV
                </button>
                <button
                  onClick={() => exportSearchLogs('json')}
                  className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-1" />
                  Export JSON
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query String</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicked Doc ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">log-{log.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.username ? (
                          <span className="text-orange-600">usr-{log.user_id} (@{log.username})</span>
                        ) : (
                          <span className="text-gray-400">Anonymous</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.query_string}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.clicked_doc_id ? (
                          <Link to={`/questions/${log.clicked_doc_id}`} className="text-teal-600 hover:underline">
                            doc-{log.clicked_doc_id}
                          </Link>
                        ) : (
                          <span className="text-gray-400">NULL (Search Only)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const SEOAnalytics = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [editingSEO, setEditingSEO] = useState(null);
  const [seoData, setSeoData] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    alt_text: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && user.role !== 'data_seo_specialist' && user.role !== 'super_admin') {
      setError('Access denied. Data & SEO Specialist privileges required.');
      setLoading(false);
      return;
    }

    loadData();
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [docsRes, analyticsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/admin/seo/documents', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      setDocuments(docsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSEO = (doc) => {
    setEditingSEO(doc.id);
    setSeoData({
      meta_title: doc.meta_title || '',
      meta_description: doc.meta_description || '',
      meta_keywords: doc.meta_keywords || '',
      alt_text: doc.alt_text || ''
    });
  };

  const handleSaveSEO = async (docId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/admin/seo/documents/${docId}`,
        seoData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setEditingSEO(null);
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update SEO data');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">SEO & Analytics Dashboard</h1>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Documents</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.total_documents || 0}</p>
                </div>
                <DocumentTextIcon className="w-12 h-12 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.total_views || 0}</p>
                </div>
                <EyeIcon className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Searches</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.total_searches || 0}</p>
                </div>
                <MagnifyingGlassIcon className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. View Time</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.avg_views || 0}</p>
                </div>
                <ChartBarIcon className="w-12 h-12 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* SEO Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">SEO Metadata Management</h2>
          <div className="space-y-4">
            {documents.map(doc => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                    <p className="text-sm text-gray-600">Views: {doc.views_count || 0}</p>
                  </div>
                  <button
                    onClick={() => editingSEO === doc.id ? handleSaveSEO(doc.id) : handleEditSEO(doc)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    {editingSEO === doc.id ? 'Save' : 'Edit SEO'}
                  </button>
                </div>

                {editingSEO === doc.id ? (
                  <div className="space-y-3 bg-gray-50 p-4 rounded">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                      <input
                        type="text"
                        value={seoData.meta_title}
                        onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="SEO-optimized title (50-60 chars)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                      <textarea
                        value={seoData.meta_description}
                        onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="3"
                        placeholder="SEO-optimized description (150-160 chars)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                      <input
                        type="text"
                        value={seoData.meta_keywords}
                        onChange={(e) => setSeoData({ ...seoData, meta_keywords: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
                      <input
                        type="text"
                        value={seoData.alt_text}
                        onChange={(e) => setSeoData({ ...seoData, alt_text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Descriptive alt text for images"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Meta Title:</p>
                      <p className="text-gray-600">{doc.meta_title || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Meta Description:</p>
                      <p className="text-gray-600">{doc.meta_description || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Keywords:</p>
                      <p className="text-gray-600">{doc.meta_keywords || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Alt Text:</p>
                      <p className="text-gray-600">{doc.alt_text || 'Not set'}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SEO Best Practices */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">SEO Best Practices</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Meta Title: 50-60 characters, include primary keyword</li>
            <li>• Meta Description: 150-160 characters, compelling call-to-action</li>
            <li>• Keywords: 3-5 relevant keywords, avoid keyword stuffing</li>
            <li>• Alt Text: Descriptive, include context and keywords naturally</li>
            <li>• Monitor analytics regularly to track performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SEOAnalytics;

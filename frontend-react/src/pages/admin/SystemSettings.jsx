import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const SystemSettings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [reindexResult, setReindexResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && user.role !== 'super_admin') {
      navigate('/admin');
      return;
    }

    loadHealth();
  }, [isAuthenticated, user, navigate]);

  const loadHealth = async () => {
    try {
      const response = await axios.get('http://localhost:8000/health');
      setHealth(response.data);
    } catch (error) {
      console.error('Failed to load health status:', error);
    }
  };

  const handleReindex = async () => {
    if (!confirm('This will rebuild the search index for all published documents. Continue?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setReindexResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/admin/reindex',
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setReindexResult(response.data);
      loadHealth(); // Refresh health status
    } catch (error) {
      setError(error.response?.data?.detail || 'Reindexing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage system-level configurations and maintenance tasks
          </p>
        </div>

        {/* Health Status Card */}
        {health && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <CheckCircleIcon className={`w-6 h-6 mr-2 ${health.database === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                  <p className="text-sm text-gray-600">Database</p>
                  <p className="font-semibold capitalize">{health.database}</p>
                </div>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className={`w-6 h-6 mr-2 ${health.search_engine === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                  <p className="text-sm text-gray-600">Search Engine</p>
                  <p className="font-semibold capitalize">{health.search_engine}</p>
                </div>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-6 h-6 mr-2 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Indexed Documents</p>
                  <p className="font-semibold">{health.indexed_documents}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reindex Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Search Engine Reindex</h2>
              <p className="text-sm text-gray-600 mt-1">
                Rebuild the search index to include all published documents
              </p>
            </div>
            <button
              onClick={handleReindex}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <ArrowPathIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Reindexing...' : 'Reindex Now'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {reindexResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{reindexResult.message}</p>
                  <div className="mt-2 text-sm text-green-700 space-y-1">
                    <p>• Indexed Documents: {reindexResult.indexed_documents}</p>
                    <p>• Vocabulary Size: {reindexResult.vocabulary_size.toLocaleString()} terms</p>
                    <p>• Average Document Length: {reindexResult.avg_doc_length} tokens</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Reindexing may take a few seconds depending on the number of documents. 
              The search engine will continue to work during this process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

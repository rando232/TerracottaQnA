import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const SearchAnalytics = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && !['super_admin', 'data_seo_specialist'].includes(user.role)) {
      setError('Access denied. Data & SEO Specialist or Super Admin privileges required.');
      setLoading(false);
      return;
    }

    loadAnalytics();
  }, [isAuthenticated, user, navigate]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/search-analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to load analytics');
    } finally {
      setLoading(false);
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Search Analytics</h1>
          <p className="text-gray-600 mt-2">Query performance, click-through rates, and search metrics</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.summary?.total_searches || 0}
                </p>
              </div>
              <MagnifyingGlassIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Queries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.summary?.unique_queries || 0}
                </p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Results</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.summary?.avg_results?.toFixed(1) || 0}
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zero Results</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {analytics?.summary?.zero_result_rate || '0%'}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Top Queries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Queries</h2>
            <div className="space-y-3">
              {analytics?.top_queries?.length > 0 ? (
                analytics.top_queries.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.query}</p>
                      <p className="text-sm text-gray-600">
                        {item.search_count} searches • Avg {item.avg_results} results
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(item.search_count / analytics.top_queries[0].search_count * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No search data yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Zero Result Queries</h2>
            <div className="space-y-3">
              {analytics?.zero_result_queries?.length > 0 ? (
                analytics.zero_result_queries.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.query}</p>
                      <p className="text-sm text-gray-600">
                        {item.search_count} failed searches
                      </p>
                    </div>
                    <span className="text-red-600 font-semibold">0 results</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No zero-result queries</p>
              )}
            </div>
          </div>
        </div>

        {/* Click-Through Rates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Click-Through Rates by Query</h2>
          <div className="space-y-4">
            {analytics?.ctr_by_query?.length > 0 ? (
              analytics.ctr_by_query.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.query}</p>
                      <p className="text-sm text-gray-600">
                        {item.clicks} clicks / {item.searches} searches
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${
                        item.ctr >= 30 ? 'text-green-600' :
                        item.ctr >= 10 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {item.ctr}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.ctr >= 30 ? 'bg-green-600' :
                        item.ctr >= 10 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${item.ctr}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No click data yet</p>
            )}
          </div>
        </div>

        {/* Recent Searches */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Searches</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Results</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicked</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics?.recent_searches?.length > 0 ? (
                  analytics.recent_searches.map((search, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{search.query}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{search.result_count}</td>
                      <td className="px-4 py-3 text-sm">
                        {search.clicked_document_id ? (
                          <span className="text-green-600">✓ Yes</span>
                        ) : (
                          <span className="text-gray-400">— No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No recent searches
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Performance Insights</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Good CTR:</strong> 30% or higher indicates relevant search results</li>
            <li>• <strong>Fair CTR:</strong> 10-30% suggests room for improvement in result ranking</li>
            <li>• <strong>Poor CTR:</strong> Below 10% means search results may not match user intent</li>
            <li>• <strong>Zero Results:</strong> These queries should be analyzed to improve content coverage</li>
            <li>• <strong>Avg Results:</strong> Too many results (50+) may indicate overly broad queries</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;

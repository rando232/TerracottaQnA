import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { searchAPI } from '../api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchStats, setSearchStats] = useState(null);
  const [popularQueries, setPopularQueries] = useState([]);
  const [correctedQuery, setCorrectedQuery] = useState('');
  const [corrections, setCorrections] = useState([]);

  useEffect(() => {
    loadPopularQueries();
  }, []);

  const loadPopularQueries = async () => {
    try {
      const response = await searchAPI.getPopularQueries(5);
      setPopularQueries(response.data);
    } catch (error) {
      console.error('Failed to load popular queries:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      const response = await searchAPI.search(query, 20);
      const data = response.data;
      
      setResults(data.results || []);
      setSearchStats({
        total: data.total_results,
        responseTime: data.response_time_ms,
        queryTerms: data.query_terms
      });
      setCorrectedQuery(data.corrected_query || '');
      setCorrections(data.corrections || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (searchQuery) => {
    setQuery(searchQuery);
    // Trigger search
    setTimeout(() => {
      document.getElementById('search-form').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 100);
  };

  const handleResultClick = async (docId, rank) => {
    try {
      await searchAPI.logClick({
        query,
        doc_id: docId,
        rank,
        clicked: true
      });
    } catch (error) {
      console.error('Failed to log click:', error);
    }
  };

  const highlightSnippet = (snippet) => {
    if (!snippet) return '';
    
    // Simple highlighting - in production, use the backend's highlighting
    return snippet.replace(/\*\*(.*?)\*\*/g, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <form id="search-form" onSubmit={handleSearch} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions using BM25 ranking..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Spell correction suggestion */}
          {correctedQuery && correctedQuery !== query && (
            <div className="mt-3 text-sm">
              <span className="text-gray-600">Did you mean: </span>
              <button
                onClick={() => handleQuickSearch(correctedQuery)}
                className="text-primary-600 hover:text-primary-700 font-medium underline"
              >
                {correctedQuery}
              </button>
              {corrections.length > 0 && (
                <span className="ml-2 text-gray-500">
                  ({corrections.map(c => `${c.original}→${c.corrected}`).join(', ')})
                </span>
              )}
            </div>
          )}

          {/* Search stats */}
          {searchStats && (
            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
              <span>
                {searchStats.total} result{searchStats.total !== 1 ? 's' : ''} found
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{searchStats.responseTime.toFixed(2)}ms</span>
              </span>
              {searchStats.queryTerms.length > 0 && (
                <>
                  <span>•</span>
                  <span>
                    Query terms: {searchStats.queryTerms.join(', ')}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!searchPerformed ? (
          /* Initial state - show popular queries */
          <div>
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Advanced IR Search
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Our search system uses state-of-the-art Information Retrieval techniques:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span><strong>BM25 Ranking:</strong> Industry-standard probabilistic ranking function</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span><strong>Spell Correction:</strong> Automatic query correction using Levenshtein distance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span><strong>Query-focused Snippets:</strong> Context-aware result previews</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span><strong>DAAT Processing:</strong> Document-at-a-time with priority queue</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span><strong>Delta Encoding:</strong> Compressed inverted index for fast retrieval</span>
                </li>
              </ul>
            </div>

            {popularQueries.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ChartBarIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Popular Searches</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularQueries.map((pq, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSearch(pq.query)}
                      className="px-4 py-2 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-lg transition-colors"
                    >
                      {pq.query}
                      <span className="ml-2 text-xs text-gray-500">
                        ({pq.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : loading ? (
          /* Loading state */
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          /* No results */
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-6">
              Try different keywords or check your spelling
            </p>
            {popularQueries.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-3">Try these popular searches:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {popularQueries.slice(0, 3).map((pq, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSearch(pq.query)}
                      className="px-3 py-1 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-lg text-sm transition-colors"
                    >
                      {pq.query}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div className="space-y-4">
            {results.map((result, index) => (
              <Link
                key={result.doc_id}
                to={`/questions/${result.doc_id}`}
                onClick={() => handleResultClick(result.doc_id, index + 1)}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 mb-2">
                  {result.title}
                </h3>

                {/* Snippet */}
                {result.snippet && (
                  <div 
                    className="text-gray-600 mb-3 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: highlightSnippet(result.snippet) }}
                  />
                )}

                {/* Metadata */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="font-medium">
                    Score: {result.score.toFixed(4)}
                  </span>
                  <span>•</span>
                  <span>
                    Rank #{index + 1}
                  </span>
                  {result.category && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {result.category}
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';
import QuestionCard from '../components/QuestionCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Pagination from '../components/Pagination';
import { documentsAPI, categoriesAPI, tagsAPI, votesAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const Directory = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated } = useAuth();

  // Filter state
  const [filters, setFilters] = useState({
    category_id: null,
    tag_id: null,
    search: '',
    sort_by: 'created_at'
  });

  const itemsPerPage = 20;

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [currentPage, filters]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagsAPI.getAll();
      setTags(response.data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      const response = await documentsAPI.getAll(params);
      setQuestions(response.data);
      
      // Calculate total pages (assuming backend returns total count in future)
      setTotalPages(Math.ceil(response.data.length / itemsPerPage) || 1);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (questionId, voteType) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    try {
      await votesAPI.vote({
        target_type: 'document',
        target_id: questionId,
        vote_type: voteType
      });
      loadQuestions();
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category_id: null,
      tag_id: null,
      search: '',
      sort_by: 'created_at'
    });
    setCurrentPage(1);
  };

  const activeFilterCount = [
    filters.category_id,
    filters.tag_id,
    filters.search
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Question Directory
          </h1>
          <p className="text-gray-600">
            Browse and filter all questions in the community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <FunnelIcon className="w-5 h-5 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search questions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="created_at">Latest</option>
                  <option value="vote_count">Most Voted</option>
                  <option value="views_count">Most Viewed</option>
                </select>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category_id || ''}
                  onChange={(e) => handleFilterChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag
                </label>
                <select
                  value={filters.tag_id || ''}
                  onChange={(e) => handleFilterChange('tag_id', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Tags</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile filter button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile filters */}
            {showFilters && (
              <div className="lg:hidden mb-4 bg-white rounded-lg shadow-sm p-4 animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="created_at">Latest</option>
                    <option value="vote_count">Most Voted</option>
                    <option value="views_count">Most Viewed</option>
                  </select>

                  <select
                    value={filters.category_id || ''}
                    onChange={(e) => handleFilterChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>

                  <select
                    value={filters.tag_id || ''}
                    onChange={(e) => handleFilterChange('tag_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">All Tags</option>
                    {tags.map(tag => (
                      <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                  </select>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="w-full text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
            </div>

            {/* Questions list */}
            {loading ? (
              <LoadingSkeleton count={5} />
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">No questions found</p>
                <button
                  onClick={clearFilters}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear filters to see all questions
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onVote={handleVote}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Directory;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { documentsAPI, categoriesAPI, tagsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const AskQuestion = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category_id: '',
    tag_ids: []
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    loadCategories();
    loadTags();
  }, [isAuthenticated, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        tag_ids: selectedTags.map(t => t.id)
      };

      const response = await documentsAPI.create(submitData);
      navigate(`/questions/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create question. Please try again.');
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

  const handleTagSelect = (tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tagId) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ask a Question
          </h1>
          <p className="text-gray-600">
            Share your question with the community and get expert answers
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Writing a good question
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific and clear in your title</li>
            <li>• Provide context and background in the content</li>
            <li>• Add relevant tags to help others find your question</li>
            <li>• Use markdown formatting for code, lists, and emphasis</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="What is your question? Be specific."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
            <p className="mt-2 text-sm text-gray-500">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              Summary (Optional)
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={2}
              value={formData.summary}
              onChange={handleChange}
              placeholder="A brief one-line summary of your question"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content *
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
            
            {!showPreview ? (
              <textarea
                id="content"
                name="content"
                rows={12}
                required
                value={formData.content}
                onChange={handleChange}
                placeholder="Provide detailed information about your question. Use Markdown for formatting.&#x0A;&#x0A;Example:&#x0A;## Background&#x0A;I'm working on...&#x0A;&#x0A;## What I've Tried&#x0A;- Attempt 1&#x0A;- Attempt 2&#x0A;&#x0A;```python&#x0A;# Your code here&#x0A;```"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
              />
            ) : (
              <div className="min-h-[300px] px-4 py-3 border border-gray-300 rounded-lg prose max-w-none">
                {formData.content ? (
                  <div className="markdown-content">
                    {formData.content}
                  </div>
                ) : (
                  <p className="text-gray-400">Nothing to preview yet...</p>
                )}
              </div>
            )}
            
            <p className="mt-2 text-sm text-gray-500">
              Markdown is supported. You can use headings, lists, code blocks, etc.
            </p>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} - {category.description}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            
            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag.id)}
                      className="ml-2 hover:text-blue-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag selector */}
            <select
              onChange={(e) => {
                const tagId = parseInt(e.target.value);
                const tag = tags.find(t => t.id === tagId);
                if (tag) {
                  handleTagSelect(tag);
                  e.target.value = '';
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Add a tag...</option>
              {tags
                .filter(tag => !selectedTags.find(t => t.id === tag.id))
                .map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
            </select>
            
            <p className="mt-2 text-sm text-gray-500">
              Select up to 5 tags to help others find your question
            </p>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>{loading ? 'Posting...' : 'Post Question'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;

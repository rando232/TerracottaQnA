import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon,
  FireIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import QuestionCard from '../components/QuestionCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { documentsAPI, votesAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadQuestions();
  }, [sortBy]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await documentsAPI.getAll({
        sort_by: sortBy,
        limit: 10,
        offset: 0
      });
      setQuestions(response.data);
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
      
      // Refresh questions to show updated vote count
      loadQuestions();
    } catch (error) {
      console.error('Vote failed:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Terracotta QnA
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              A community-driven platform for Information Retrieval and Search Engineering
            </p>
            
            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <Link 
                to="/search"
                className="flex items-center bg-white text-gray-900 rounded-lg px-4 py-3 hover:shadow-lg transition-shadow"
              >
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-500">Search for questions...</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
              <div>
                <div className="text-3xl font-bold">{questions.length}+</div>
                <div className="text-primary-200">Questions</div>
              </div>
              <div>
                <div className="text-3xl font-bold">100+</div>
                <div className="text-primary-200">Answers</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-primary-200">Members</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sort tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSortBy('created_at')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'created_at'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ClockIcon className="w-5 h-5" />
              <span>Latest</span>
            </button>
            
            <button
              onClick={() => setSortBy('vote_count')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'vote_count'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FireIcon className="w-5 h-5" />
              <span>Top Voted</span>
            </button>

            <button
              onClick={() => setSortBy('views_count')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'views_count'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Most Viewed</span>
            </button>
          </div>

          <Link
            to="/directory"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </Link>
        </div>

        {/* Questions list */}
        {loading ? (
          <LoadingSkeleton count={5} />
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No questions yet. Be the first to ask!</p>
            <Link
              to="/ask"
              className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Ask a Question
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onVote={handleVote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

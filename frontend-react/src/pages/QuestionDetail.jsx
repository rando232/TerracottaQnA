import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon,
  EyeIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { documentsAPI, commentsAPI, votesAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [question, setQuestion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestion();
    loadComments();
    incrementViews();
  }, [id]);

  const loadQuestion = async () => {
    try {
      const response = await documentsAPI.getById(id);
      setQuestion(response.data);
    } catch (error) {
      console.error('Failed to load question:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await commentsAPI.getByDocument(id);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const incrementViews = async () => {
    try {
      await documentsAPI.incrementViews(id);
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  };

  const handleVote = async (targetType, targetId, voteType) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    try {
      await votesAPI.vote({
        target_type: targetType,
        target_id: targetId,
        vote_type: voteType
      });
      
      if (targetType === 'document') {
        loadQuestion();
      } else {
        loadComments();
      }
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to answer');
      return;
    }

    if (!answerContent.trim()) {
      alert('Please enter your answer');
      return;
    }

    setSubmitting(true);
    try {
      await commentsAPI.create({
        document_id: parseInt(id),
        content: answerContent
      });
      
      setAnswerContent('');
      loadComments();
      loadQuestion(); // Refresh to update comment count
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await documentsAPI.delete(id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      await commentsAPI.delete(commentId);
      loadComments();
      loadQuestion();
    } catch (error) {
      console.error('Failed to delete answer:', error);
      alert('Failed to delete answer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">Question not found</p>
            <Link to="/" className="text-primary-600 hover:text-primary-700">
              Go back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canModify = user && (
    user.id === question.author_id || 
    ['super_admin', 'content_manager', 'moderator'].includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {question.title}
              </h1>
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <Link
                  to={`/users/${question.author_username}`}
                  className="flex items-center space-x-2 hover:text-primary-600"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="font-medium">{question.author_name || question.author_username}</span>
                </Link>
                
                <span className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                  </span>
                </span>

                <span className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{question.views_count || 0} views</span>
                </span>

                <span className="flex items-center space-x-1">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>{question.comment_count || 0} answers</span>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            {canModify && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/questions/${id}/edit`}
                  className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleDeleteQuestion}
                  className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex space-x-6">
            {/* Vote section */}
            <div className="flex flex-col items-center space-y-2 flex-shrink-0">
              <button
                onClick={() => handleVote('document', question.id, 'upvote')}
                className="vote-btn"
              >
                <ArrowUpIcon className="w-8 h-8 text-gray-600 hover:text-primary-600" />
              </button>
              <span className={`text-2xl font-bold ${
                question.vote_count > 0 ? 'text-primary-600' : 
                question.vote_count < 0 ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {question.vote_count || 0}
              </span>
              <button
                onClick={() => handleVote('document', question.id, 'downvote')}
                className="vote-btn"
              >
                <ArrowDownIcon className="w-8 h-8 text-gray-600 hover:text-red-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {question.category_name && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {question.category_name}
                  </span>
                )}
                {question.tags && question.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="tag tag-clickable"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Summary */}
              {question.summary && (
                <p className="text-lg text-gray-700 mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                  {question.summary}
                </p>
              )}

              {/* Full content */}
              <div className="markdown-content prose max-w-none">
                <ReactMarkdown>{question.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Answers section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {comments.length} {comments.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          {/* Answers list */}
          <div className="space-y-6 mb-8">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex space-x-4">
                  {/* Vote */}
                  <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                    <button
                      onClick={() => handleVote('comment', comment.id, 'upvote')}
                      className="vote-btn"
                    >
                      <ArrowUpIcon className="w-6 h-6 text-gray-600 hover:text-primary-600" />
                    </button>
                    <span className={`text-lg font-bold ${
                      comment.vote_count > 0 ? 'text-primary-600' : 
                      comment.vote_count < 0 ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {comment.vote_count || 0}
                    </span>
                    <button
                      onClick={() => handleVote('comment', comment.id, 'downvote')}
                      className="vote-btn"
                    >
                      <ArrowDownIcon className="w-6 h-6 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="markdown-content prose max-w-none mb-4">
                      <ReactMarkdown>{comment.content}</ReactMarkdown>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Link
                          to={`/users/${comment.author_username}`}
                          className="font-medium hover:text-primary-600"
                        >
                          {comment.author_name || comment.author_username}
                        </Link>
                        <span>
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Delete button */}
                      {user && (user.id === comment.author_id || ['super_admin', 'moderator'].includes(user.role)) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Answer form */}
          {isAuthenticated ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
              <form onSubmit={handleSubmitAnswer}>
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Write your answer here... (Markdown supported)"
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">
                    You can use Markdown for formatting
                  </p>
                  <button
                    type="submit"
                    disabled={submitting || !answerContent.trim()}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Post Answer'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">Please login to answer this question</p>
              <Link
                to="/login"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;

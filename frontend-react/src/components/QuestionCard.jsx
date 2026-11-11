import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const QuestionCard = ({ question, onVote }) => {
  const {
    id,
    title,
    summary,
    author_name,
    author_username,
    category_name,
    tags = [],
    vote_count,
    comment_count,
    views_count,
    created_at,
  } = question;

  const handleVote = (voteType) => {
    if (onVote) {
      onVote(id, voteType);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200">
      <div className="flex space-x-4">
        {/* Vote section */}
        <div className="flex flex-col items-center space-y-2 flex-shrink-0">
          <button
            onClick={() => handleVote('upvote')}
            className="vote-btn"
            aria-label="Upvote"
          >
            <ArrowUpIcon className="w-6 h-6 text-gray-600 hover:text-primary-600" />
          </button>
          <span className={`text-lg font-bold ${
            vote_count > 0 ? 'text-primary-600' : 
            vote_count < 0 ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {vote_count || 0}
          </span>
          <button
            onClick={() => handleVote('downvote')}
            className="vote-btn"
            aria-label="Downvote"
          >
            <ArrowDownIcon className="w-6 h-6 text-gray-600 hover:text-red-600" />
          </button>
        </div>

        {/* Content section */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <Link 
            to={`/questions/${id}`}
            className="block group"
          >
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
              {title}
            </h2>
          </Link>

          {/* Summary */}
          {summary && (
            <p className="text-gray-600 mb-3 line-clamp-2">
              {summary}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="tag tag-clickable"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {/* Category */}
            {category_name && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {category_name}
              </span>
            )}

            {/* Author */}
            <Link 
              to={`/users/${author_username}`}
              className="hover:text-primary-600 transition-colors font-medium"
            >
              {author_name || author_username}
            </Link>

            {/* Time */}
            <span className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>
                {created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) : 'recently'}
              </span>
            </span>

            {/* Comments */}
            <span className="flex items-center space-x-1">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{comment_count || 0} answers</span>
            </span>

            {/* Views */}
            <span className="flex items-center space-x-1">
              <EyeIcon className="w-4 h-4" />
              <span>{views_count || 0} views</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;

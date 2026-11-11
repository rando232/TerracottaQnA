import React from 'react';

const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex space-x-4">
            {/* Vote skeleton */}
            <div className="flex flex-col items-center space-y-2 flex-shrink-0">
              <div className="w-6 h-6 skeleton rounded" />
              <div className="w-8 h-6 skeleton rounded" />
              <div className="w-6 h-6 skeleton rounded" />
            </div>

            {/* Content skeleton */}
            <div className="flex-1">
              {/* Title */}
              <div className="h-6 skeleton rounded mb-3 w-3/4" />
              
              {/* Summary */}
              <div className="space-y-2 mb-3">
                <div className="h-4 skeleton rounded w-full" />
                <div className="h-4 skeleton rounded w-5/6" />
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-3">
                <div className="h-6 w-16 skeleton rounded-full" />
                <div className="h-6 w-20 skeleton rounded-full" />
                <div className="h-6 w-24 skeleton rounded-full" />
              </div>

              {/* Meta */}
              <div className="flex gap-4">
                <div className="h-4 w-24 skeleton rounded" />
                <div className="h-4 w-32 skeleton rounded" />
                <div className="h-4 w-20 skeleton rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;

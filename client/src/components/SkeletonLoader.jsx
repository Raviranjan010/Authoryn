import React from 'react';

// Single Blog Card Skeleton
export const BlogCardSkeleton = () => {
  return (
    <div className="border border-border-light rounded-xl overflow-hidden bg-white p-5 space-y-4 animate-pulse font-sans">
      {/* Cover Image Placeholder */}
      <div className="aspect-video bg-gray-200 rounded-lg w-full" />
      
      {/* Content Placements */}
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>

      {/* Author Footer Placeholder */}
      <div className="flex items-center space-x-3 pt-4 border-t border-border-light">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

// Grid of Blog Card Skeletons
export const BlogGridSkeleton = ({ count = 3 }) => {
  const list = Array(count).fill(0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {list.map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Single Post Detail Skeleton
export const PostDetailSkeleton = () => {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-12 space-y-8 animate-pulse font-sans">
      <div className="h-[320px] bg-gray-200 rounded-xl w-full" />
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
      <hr className="border-border-light" />
      <div className="space-y-3">
        <div className="h-4.5 bg-gray-200 rounded w-full" />
        <div className="h-4.5 bg-gray-200 rounded w-full" />
        <div className="h-4.5 bg-gray-200 rounded w-5/6" />
        <div className="h-4.5 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  );
};

// Dashboard Stats Widget Skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      {/* 3 cards stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="border border-border-light bg-white rounded-xl p-5 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
      {/* Table */}
      <div className="border border-border-light bg-white rounded-xl overflow-hidden p-6 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-1/5 mb-6" />
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-border-light last:border-0">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/6" />
            <div className="h-4 bg-gray-200 rounded w-1/12" />
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-8 font-sans">
      {/* Prev Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-border-light text-text-secondary hover:text-accent-green hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-secondary cursor-pointer transition-colors"
      >
        <FiChevronLeft className="text-lg" />
      </button>

      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            currentPage === page
              ? 'bg-accent-green text-white shadow-sm'
              : 'border border-transparent text-text-secondary hover:text-text-primary hover:bg-white'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-border-light text-text-secondary hover:text-accent-green hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-secondary cursor-pointer transition-colors"
      >
        <FiChevronRight className="text-lg" />
      </button>
    </div>
  );
};

export default Pagination;

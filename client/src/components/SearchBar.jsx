import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export const SearchBar = ({ value, onChange, placeholder = "Search stories..." }) => {
  return (
    <div className="relative w-full max-w-md font-sans">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <FiSearch className="text-text-secondary text-base" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-border-light focus:border-accent-green focus:ring-1 focus:ring-accent-green/20 rounded-full text-[14px] placeholder-text-secondary/50 text-text-primary focus:outline-none transition-all shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-accent-green cursor-pointer"
        >
          <FiX className="text-sm" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

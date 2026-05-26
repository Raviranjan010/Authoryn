import React from 'react';

export const TagPill = ({ tag, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick && onClick(tag)}
      className={`text-xs font-medium tracking-wider uppercase px-4.5 py-2 border transition-all duration-150 rounded-[4px] whitespace-nowrap cursor-pointer ${
        isActive
          ? 'bg-[#5B4FE8] border-[#5B4FE8] text-[#F7F5F0]'
          : 'bg-transparent border-[#111111]/40 text-[#111111] hover:border-[#111111] hover:text-[#5B4FE8]'
      }`}
    >
      {tag}
    </button>
  );
};

export default TagPill;

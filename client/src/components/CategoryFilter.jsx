import React from 'react';

export const CategoryFilter = ({ selectedCategory, onSelectCategory, categories = [] }) => {
  const allCategories = ['All', ...categories];

  return (
    <div className="flex space-x-6 text-[12px] uppercase tracking-widest font-bold text-text-secondary border-b border-border-light pb-1 overflow-x-auto hide-scrollbar font-sans w-full">
      {allCategories.map((category) => {
        const active = selectedCategory === (category === 'All' ? '' : category.toLowerCase());
        
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category === 'All' ? '' : category.toLowerCase())}
            className={`pb-2 transition-all relative cursor-pointer whitespace-nowrap ${
              active 
                ? 'text-accent-green font-extrabold' 
                : 'hover:text-text-primary'
            }`}
          >
            <span>{category}</span>
            {active && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-green rounded-full animate-in fade-in zoom-in-50 duration-200" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;

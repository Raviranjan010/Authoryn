import React from 'react';
import { RiLeafLine } from 'react-icons/ri';

export const LoadingSpinner = ({ fullScreen = true, message = "Loading LeafBlog..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center font-sans">
      <div className="relative flex items-center justify-center">
        {/* Outer spinner */}
        <div className="w-16 h-16 border-4 border-soft-accent border-t-accent-green rounded-full animate-spin"></div>
        {/* Inner static brand mark */}
        <div className="absolute text-accent-green text-2xl animate-pulse">
          <RiLeafLine />
        </div>
      </div>
      <p className="text-sm font-semibold tracking-wide text-text-secondary animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;

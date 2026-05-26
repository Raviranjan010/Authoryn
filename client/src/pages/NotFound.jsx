import React from 'react';
import { Link } from 'react-router-dom';
import { RiLeafLine } from 'react-icons/ri';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-20 font-sans text-center">
      <div className="space-y-6 max-w-sm">
        <div className="flex justify-center">
          <div className="p-4 bg-soft-accent rounded-3xl text-accent-green text-4xl shadow-sm animate-bounce">
            <RiLeafLine />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-serif text-text-primary">Page Not Found</h1>
          <p className="text-sm text-text-secondary font-light">
            The article or directory you are looking for has been relocated or does not exist.
          </p>
        </div>

        <div className="pt-4">
          <Link to="/" className="btn-primary text-xs px-6 py-2.5 rounded-full font-bold shadow-sm inline-block">
            &larr; Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

import React from 'react';
import { Link } from 'react-router-dom';
import { RiLeafLine } from 'react-icons/ri';
import { FiExternalLink, FiArrowRight } from 'react-icons/fi';

export const About = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary pb-20 font-sans">
      <div className="max-w-[720px] mx-auto px-6 pt-16 space-y-12 text-left">
        
        {/* Logo and Intro */}
        <div className="space-y-4">
          <div className="inline-flex p-4 bg-soft-accent rounded-3xl text-accent-green text-4xl shadow-sm">
            <RiLeafLine />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight">About Authoryn</h1>
          <p className="text-lg text-text-secondary leading-relaxed font-light">
            Authoryn is a MERN-stack publishing platform designed for absolute clarity, readability, and content focus. We combine typographic elegance with modern security structures.
          </p>
        </div>

        <hr className="border-border-light" />

        {/* Content Section 1 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-serif">Typographic Intent</h2>
          <p className="text-[15px] leading-relaxed text-text-secondary font-light">
            We believe that reading online should feel like flipping through a high-end printed magazine. To achieve this, Authoryn pairs <b>Fraunces</b>—a soft-serif font that makes long paragraphs comfortable to read—with <b>Outfit</b> and <b>Inter</b>, hyper-functional sans-serifs that manage controls, settings, and buttons with maximum layout clarity.
          </p>
        </div>

        {/* Content Section 2 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-serif">Under the Hood</h2>
          <p className="text-[15px] leading-relaxed text-text-secondary font-light">
            Behind the minimal interface is a complete database system engineered with:
          </p>
          <ul className="space-y-3 pl-4 text-xs font-semibold text-text-secondary">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-accent-green rounded-full"></span>
              <span>JWT persistent auth saved securely inside HTTP-only cookies</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-accent-green rounded-full"></span>
              <span>Optimistic layout updates for post liking and comment threads</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-accent-green rounded-full"></span>
              <span>Automatic Mongoose document timestamps and URL slugification</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-accent-green rounded-full"></span>
              <span>Cloudinary file storage with a fully functional local upload fallback</span>
            </li>
          </ul>
        </div>

        {/* Call to action */}
        <div className="bg-white border border-border-light rounded-2xl p-8 shadow-premium text-center space-y-4">
          <h3 className="text-xl font-bold font-serif">Inspired to share your thoughts?</h3>
          <p className="text-xs text-text-secondary font-medium">Create a free writer account to access the markdown editor dashboard.</p>
          <div className="flex justify-center pt-2">
            <Link to="/register" className="btn-primary flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold shadow-sm">
              <span>Sign Up Free</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;

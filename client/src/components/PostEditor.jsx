import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ]
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'blockquote', 'code-block',
  'list', 'bullet',
  'link', 'image'
];

export const PostEditor = ({ value, onChange, placeholder = 'Write your story...' }) => {
  // Calculate text character count by stripping HTML tags
  const getCharacterCount = (html) => {
    if (!html) return 0;
    const cleanText = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return cleanText.length;
  };

  return (
    <div className="space-y-2">
      <div className="editor-container font-sans">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="bg-transparent text-[19px] leading-relaxed"
        />
      </div>
      <div className="flex justify-between items-center text-xs text-[#666666] px-1 font-mono">
        <span>Rich Text Editor</span>
        <span>{getCharacterCount(value)} characters</span>
      </div>
    </div>
  );
};

export default PostEditor;

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { FiBold, FiItalic, FiUnderline, FiLink, FiImage, FiCode, FiList, FiRotateCcw, FiRotateCw } from 'react-icons/fi';
import { RiStrikethrough, RiListOrdered, RiDoubleQuotesL, RiH1, RiH2, RiH3, RiParagraph, RiCodeBoxLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export const PostEditor = ({ value, onChange, placeholder = 'Write your story...' }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [showLinkPopover, setShowLinkPopover] = useState(false);

  const imagePopoverRef = useRef(null);
  const linkPopoverRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent-green underline cursor-pointer'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-6 shadow-md'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  // Sync content with value from parent if it changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Click outside handlers to close popovers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (imagePopoverRef.current && !imagePopoverRef.current.contains(event.target)) {
        setShowImagePopover(false);
      }
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(event.target)) {
        setShowLinkPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!editor) {
    return null;
  }

  // Get character count
  const getCharacterCount = () => {
    const text = editor.getText();
    return text.trim() === '' ? 0 : text.length;
  };

  const handleAddImageFromUrl = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImagePopover(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        editor.chain().focus().setImage({ src: event.target.result }).run();
        setShowImagePopover(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      // Basic validation for protocol prefix if missing
      let url = linkUrl.trim();
      if (url && !/^https?:\/\//i.test(url) && !/^\//.test(url)) {
        url = 'https://' + url;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setLinkUrl('');
    setShowLinkPopover(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkPopover(false);
  };

  const toggleLinkMenu = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setShowLinkPopover(!showLinkPopover);
    setShowImagePopover(false);
  };

  return (
    <div className="space-y-2">
      <div className="tiptap-editor-container">
        
        {/* Sticky/Structured Premium Toolbar */}
        <div className="tiptap-toolbar border-b border-border-light flex flex-wrap gap-1 items-center bg-[#fcfbfa] px-3 py-2">
          {/* Text type formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`tiptap-toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
            title="Heading 1"
          >
            <RiH1 size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`tiptap-toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
            title="Heading 2"
          >
            <RiH2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`tiptap-toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
            title="Heading 3"
          >
            <RiH3 size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`tiptap-toolbar-btn ${editor.isActive('paragraph') ? 'is-active' : ''}`}
            title="Paragraph"
          >
            <RiParagraph size={16} />
          </button>

          <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

          {/* Inline styles */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`tiptap-toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
            title="Bold"
          >
            <FiBold size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`tiptap-toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
            title="Italic"
          >
            <FiItalic size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`tiptap-toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
            title="Underline"
          >
            <FiUnderline size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`tiptap-toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
            title="Strikethrough"
          >
            <RiStrikethrough size={16} />
          </button>

          <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

          {/* Paragraph styles */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`tiptap-toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            title="Bullet List"
          >
            <FiList size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`tiptap-toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            title="Numbered List"
          >
            <RiListOrdered size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`tiptap-toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
            title="Blockquote"
          >
            <RiDoubleQuotesL size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`tiptap-toolbar-btn ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
            title="Code Block"
          >
            <RiCodeBoxLine size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`tiptap-toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
            title="Inline Code"
          >
            <FiCode size={16} />
          </button>

          <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

          {/* Links & Images */}
          <div className="relative" ref={linkPopoverRef}>
            <button
              type="button"
              onClick={toggleLinkMenu}
              className={`tiptap-toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
              title="Add Link"
            >
              <FiLink size={16} />
            </button>
            {showLinkPopover && (
              <div className="absolute left-0 mt-2 p-3 bg-white border border-border-light rounded-xl shadow-premium z-30 w-72 space-y-3">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-background border border-border-light rounded-lg focus:outline-none focus:border-accent-green"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSetLink(); }}
                />
                <div className="flex justify-end space-x-1.5">
                  {editor.isActive('link') && (
                    <button
                      type="button"
                      onClick={handleRemoveLink}
                      className="btn-outline py-1 px-3 text-[10px] uppercase font-bold border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      Unlink
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSetLink}
                    className="btn-primary py-1 px-3.5 text-[10px] uppercase font-bold cursor-pointer"
                  >
                    Apply Link
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={imagePopoverRef}>
            <button
              type="button"
              onClick={() => { setShowImagePopover(!showImagePopover); setShowLinkPopover(false); }}
              className={`tiptap-toolbar-btn ${editor.isActive('image') ? 'is-active' : ''}`}
              title="Insert Image"
            >
              <FiImage size={16} />
            </button>
            {showImagePopover && (
              <div className="absolute left-0 mt-2 p-4 bg-white border border-border-light rounded-xl shadow-premium z-30 w-80 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-background border border-border-light rounded-lg focus:outline-none focus:border-accent-green"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddImageFromUrl(); }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageFromUrl}
                    className="w-full btn-primary py-1.5 text-[10px] uppercase font-bold mt-1 text-center justify-center cursor-pointer"
                  >
                    Insert from URL
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-text-secondary font-mono uppercase">or upload file</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <div>
                  <label className="w-full btn-outline py-2 text-[10px] uppercase font-bold text-center cursor-pointer block">
                    <span>Select Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

          {/* History */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="tiptap-toolbar-btn disabled:opacity-30 disabled:pointer-events-none"
            title="Undo"
          >
            <FiRotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="tiptap-toolbar-btn disabled:opacity-30 disabled:pointer-events-none"
            title="Redo"
          >
            <FiRotateCw size={16} />
          </button>
        </div>

        {/* Editor editable space */}
        <EditorContent editor={editor} className="bg-white min-h-[350px] text-left" />
      </div>

      <div className="flex justify-between items-center text-xs text-[#666666] px-1 font-mono">
        <span>Block-Based Editor (TipTap)</span>
        <span>{getCharacterCount()} characters</span>
      </div>
    </div>
  );
};

export default PostEditor;

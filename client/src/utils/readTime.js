/**
 * Estimates reading time based on a 200 words per minute formula.
 * Stripts HTML tags before counting words.
 * @param {string} htmlContent - HTML string representing post body.
 * @returns {string} Estimated time string e.g. "3 min read".
 */
export const calculateReadTime = (htmlContent) => {
  if (!htmlContent) return '1 min read';
  
  // Strip HTML tags using simple regex
  const text = htmlContent.replace(/<[^>]*>/g, ' ');
  
  // Count words
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Calculate reading time, rounding up
  const readTime = Math.ceil(wordCount / 200);
  
  return `${readTime || 1} min read`;
};

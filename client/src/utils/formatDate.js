import { formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Returns a relative date string (e.g. "3 days ago")
 * @param {string|Date} dateVal - Date to parse
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateVal) => {
  if (!dateVal) return '';
  try {
    const date = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
};

/**
 * Returns an absolute formatted date (e.g. "May 26, 2026")
 * @param {string|Date} dateVal - Date to parse
 * @returns {string} Formatted date string
 */
export const formatAbsoluteDate = (dateVal) => {
  if (!dateVal) return '';
  try {
    const date = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting absolute date:', error);
    return '';
  }
};

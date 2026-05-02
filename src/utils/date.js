/**
 * src/utils/date.js
 * Human-readable date helpers for transaction lists.
 */

/**
 * Converts an ISO date string to a friendly label.
 * Returns "Today", "Yesterday", or a short localized date (e.g. "29 Apr").
 *
 * @param {string} isoDate – ISO 8601 date string
 * @returns {string}
 */
export const formatRelativeDate = (isoDate) => {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

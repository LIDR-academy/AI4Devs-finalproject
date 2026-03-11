/**
 * Utility functions for formatting data in the UI
 */

/**
 * Format bytes to human-readable file size
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "1.23 MB"
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  if (bytes < 0) return 'Invalid size';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${size} ${sizes[i]}`;
};

/**
 * Format date to relative time (e.g., "2 days ago", "just now")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds)) return 'Invalid date';

  // Less than a minute
  if (diffInSeconds < 60) {
    return 'just now';
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Less than a month
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

/**
 * Format date to localized date string
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string like "Oct 25, 2025"
 */
export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format date to localized date and time string
 * @param dateString - ISO date string
 * @returns Formatted date and time string like "Oct 25, 2025, 10:30 AM"
 */
export const formatDateTime = (dateString: string): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string like "1,234"
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Sanitize filename for safe download
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove or replace special characters
  return filename
    .trim() // Trim whitespace first
    .replace(/[^\w\s.-]/g, '') // Remove special chars except word chars, spaces, dots, hyphens
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_'); // Replace multiple underscores with single
};

/**
 * Get initials from name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};


/**
 * Formatting Utilities
 * Shared formatters for displaying data across components
 * 
 * @module utils/formatters
 */

/**
 * Format bytes to human-readable file size
 * 
 * Converts raw byte values to appropriate units (B, KB, MB, GB)
 * with 1 decimal precision.
 * 
 * @param bytes - File size in bytes (can be null)
 * @param fallback - Text to display if bytes is null (default: "No data")
 * @returns Formatted string (e.g., "1.5 MB", "425.0 KB")
 * 
 * @example
 * formatFileSize(1536) // "1.5 KB"
 * formatFileSize(null) // "No data"
 * formatFileSize(0) // "0 B"
 */
export const formatFileSize = (bytes: number | null, fallback: string = 'No data'): string => {
  if (bytes === null || bytes === undefined) return fallback;
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Format ISO 8601 date string to DD/MM/YYYY format
 * 
 * Converts backend ISO timestamps to human-readable dates.
 * 
 * @param isoDate - ISO 8601 date string (e.g., "2026-02-15T10:30:00Z")
 * @param fallback - Text to display if date is null (default: "No data")
 * @returns Formatted date string (e.g., "15/02/2026")
 * 
 * @example
 * formatDate("2026-02-15T10:30:00Z") // "15/02/2026"
 * formatDate(null) // "No data"
 */
export const formatDate = (isoDate: string | null, fallback: string = 'No data'): string => {
  if (!isoDate) return fallback;
  
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format bounding box coordinates for display
 * 
 * Converts bbox object to readable string showing min and max coordinates.
 * 
 * @param bbox - Bounding box with min/max arrays
 * @param fallback - Text to display if bbox is null (default: "No data")
 * @returns Formatted coordinates string
 * 
 * @example
 * formatBBox({ min: [0, 0, 0], max: [10, 10, 10] })
 * // "min: [0, 0, 0], max: [10, 10, 10]"
 */
export const formatBBox = (
  bbox: { min: number[]; max: number[] } | null,
  fallback: string = 'No data'
): string => {
  if (!bbox) return fallback;
  return `min: [${bbox.min.join(', ')}], max: [${bbox.max.join(', ')}]`;
};

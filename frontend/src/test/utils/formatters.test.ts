/**
 * Tests for formatter utility functions
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    formatDate,
    formatDateTime,
    formatFileSize,
    formatNumber,
    formatRelativeTime,
    getInitials,
    sanitizeFilename,
    truncateText,
} from '../../utils/formatters';

describe('formatFileSize', () => {
  it('should format 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('should format megabytes with decimals', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1572864)).toBe('1.5 MB');
    expect(formatFileSize(2621440)).toBe('2.5 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('should format terabytes', () => {
    expect(formatFileSize(1099511627776)).toBe('1 TB');
  });

  it('should respect custom decimal places', () => {
    expect(formatFileSize(1572864, 0)).toBe('2 MB');
    expect(formatFileSize(1572864, 3)).toBe('1.5 MB');
  });

  it('should handle negative numbers', () => {
    expect(formatFileSize(-100)).toBe('Invalid size');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Mock the current time
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-10-25T12:00:00Z'));
  });

  it('should format "just now" for recent times', () => {
    const now = new Date('2025-10-25T11:59:30Z').toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('should format minutes ago', () => {
    const fiveMinutesAgo = new Date('2025-10-25T11:55:00Z').toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');

    const oneMinuteAgo = new Date('2025-10-25T11:59:00Z').toISOString();
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
  });

  it('should format hours ago', () => {
    const twoHoursAgo = new Date('2025-10-25T10:00:00Z').toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');

    const oneHourAgo = new Date('2025-10-25T11:00:00Z').toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
  });

  it('should format days ago', () => {
    const twoDaysAgo = new Date('2025-10-23T12:00:00Z').toISOString();
    expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');

    const oneDayAgo = new Date('2025-10-24T12:00:00Z').toISOString();
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
  });

  it('should format weeks ago', () => {
    const twoWeeksAgo = new Date('2025-10-11T12:00:00Z').toISOString();
    expect(formatRelativeTime(twoWeeksAgo)).toBe('2 weeks ago');
  });

  it('should format months ago', () => {
    const twoMonthsAgo = new Date('2025-08-25T12:00:00Z').toISOString();
    expect(formatRelativeTime(twoMonthsAgo)).toBe('2 months ago');
  });

  it('should format years ago', () => {
    const twoYearsAgo = new Date('2023-10-25T12:00:00Z').toISOString();
    expect(formatRelativeTime(twoYearsAgo)).toBe('2 years ago');
  });

  it('should handle invalid dates', () => {
    expect(formatRelativeTime('invalid-date')).toBe('Invalid date');
  });
});

describe('formatDate', () => {
  it('should format date with default options', () => {
    const date = new Date('2025-10-25T12:00:00Z').toISOString();
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Oct 25, 2025/);
  });

  it('should format date with custom options', () => {
    const date = new Date('2025-10-25T12:00:00Z').toISOString();
    const formatted = formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(formatted).toMatch(/October 25, 2025/);
  });

  it('should handle invalid dates', () => {
    expect(formatDate('invalid-date')).toBe('Invalid date');
  });
});

describe('formatDateTime', () => {
  it('should format date and time', () => {
    const date = new Date('2025-10-25T14:30:00Z').toISOString();
    const formatted = formatDateTime(date);
    expect(formatted).toMatch(/Oct 25, 2025/);
    expect(formatted).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
  });

  it('should handle invalid dates', () => {
    expect(formatDateTime('invalid-date')).toBe('Invalid date');
  });
});

describe('formatNumber', () => {
  it('should format numbers with thousand separators', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(100)).toBe('100');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1234)).toBe('-1,234');
  });
});

describe('truncateText', () => {
  it('should not truncate short text', () => {
    const text = 'Short text';
    expect(truncateText(text, 50)).toBe(text);
  });

  it('should truncate long text with default length', () => {
    const longText = 'This is a very long text that should be truncated with ellipsis';
    const result = truncateText(longText);
    expect(result).toHaveLength(53); // 50 + '...'
    expect(result).toMatch(/\.\.\.$/);
  });

  it('should truncate with custom max length', () => {
    const text = 'This is a test text';
    const result = truncateText(text, 10);
    expect(result).toBe('This is a ...');
  });

  it('should handle exact length match', () => {
    const text = '12345678901234567890123456789012345678901234567890';
    expect(truncateText(text, 50)).toBe(text);
  });
});

describe('sanitizeFilename', () => {
  it('should remove special characters', () => {
    const filename = 'Template & Test (Special) #1.pdf';
    const result = sanitizeFilename(filename);
    expect(result).toBe('Template_Test_Special_1.pdf');
  });

  it('should replace multiple spaces with single underscore', () => {
    const filename = 'Template    with    spaces.pdf';
    const result = sanitizeFilename(filename);
    expect(result).toBe('Template_with_spaces.pdf');
  });

  it('should preserve dots and hyphens', () => {
    const filename = 'template-v1.0.2.pdf';
    const result = sanitizeFilename(filename);
    expect(result).toBe('template-v1.0.2.pdf');
  });

  it('should handle already clean filenames', () => {
    const filename = 'clean_filename.pdf';
    const result = sanitizeFilename(filename);
    expect(result).toBe(filename);
  });

  it('should trim whitespace', () => {
    const filename = '  filename.pdf  ';
    const result = sanitizeFilename(filename);
    expect(result).toBe('filename.pdf');
  });
});

describe('getInitials', () => {
  it('should get initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Jane Smith')).toBe('JS');
  });

  it('should get initial from single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should get first and last from multiple names', () => {
    expect(getInitials('John Michael Doe')).toBe('JD');
  });

  it('should handle uppercase conversion', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('');
  });

  it('should handle extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD');
  });
});


import { describe, it, expect } from 'vitest';
import { formatDate, formatDateShort, getRelativeTime } from '../dateUtils';

describe('Date Utils', () => {
  const testDate = '2024-01-15T10:30:00.000Z';
  const testDate2 = '2024-01-10T14:20:00.000Z';

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate(testDate);
      expect(result).toBe('Jan 15, 2024, 05:30 AM');
    });

    it('should handle different date formats', () => {
      const result = formatDate('2024-12-25T00:00:00.000Z');
      expect(result).toBe('Dec 24, 2024, 07:00 PM');
    });
  });

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const result = formatDateShort(testDate);
      expect(result).toBe('Jan 15, 2024');
    });

    it('should handle different date formats', () => {
      const result = formatDateShort('2024-12-25T00:00:00.000Z');
      expect(result).toBe('Dec 24, 2024');
    });
  });

  describe('getRelativeTime', () => {
    it('should return "Just now" for very recent dates', () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      const result = getRelativeTime(recentDate.toISOString());
      expect(result).toBe('Just now');
    });

    it('should return minutes ago for recent dates', () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      const result = getRelativeTime(recentDate.toISOString());
      expect(result).toMatch(/^\d+ minutes? ago$/);
    });

    it('should return hours ago for older dates', () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const result = getRelativeTime(recentDate.toISOString());
      expect(result).toMatch(/^\d+ hours? ago$/);
    });

    it('should return days ago for much older dates', () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      const result = getRelativeTime(recentDate.toISOString());
      expect(result).toMatch(/^\d+ days? ago$/);
    });

    it('should return formatted date for very old dates', () => {
      const oldDate = '2023-01-01T00:00:00.000Z';
      const result = getRelativeTime(oldDate);
      expect(result).toBe('Dec 31, 2022');
    });
  });
}); 
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { faqApi } from '../../../src/api/faqApi';
import { useFAQLogic } from '../../../src/hooks/useFAQLogic';

// Mock the API
vi.mock('../../../src/api/faqApi', () => ({
  faqApi: {
    getFAQs: vi.fn(),
    createFAQ: vi.fn(),
    updateFAQ: vi.fn(),
    deleteFAQ: vi.fn(),
    searchFAQSemanticly: vi.fn(),
  }
}));

// Mock toast
vi.mock('../../../src/components/ui/use-toast', () => ({
  toast: vi.fn(),
}));

const mockFAQs = [
  {
    id: '1',
    question: 'Test Question 1',
    answer: 'Test Answer 1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

describe('useFAQLogic Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useFAQLogic());
    
    expect(result.current.faqs).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.deleting).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.searchLoading).toBe(false);
  });

  it('should provide all required methods', () => {
    const { result } = renderHook(() => useFAQLogic());
    
    expect(typeof result.current.loadFAQs).toBe('function');
    expect(typeof result.current.createFAQ).toBe('function');
    expect(typeof result.current.updateFAQ).toBe('function');
    expect(typeof result.current.deleteFAQ).toBe('function');
    expect(typeof result.current.searchFAQs).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.clearSearch).toBe('function');
  });

  it('should handle loadFAQs correctly', async () => {
    (faqApi.getFAQs as any).mockResolvedValue({ faqs: mockFAQs });
    
    const { result } = renderHook(() => useFAQLogic());
    
    await result.current.loadFAQs();
    
    await waitFor(() => {
      expect(faqApi.getFAQs).toHaveBeenCalled();
    });
  });

  it('should handle createFAQ correctly', async () => {
    const newFAQ = {
      question: 'New Question',
      answer: 'New Answer',
      isActive: true,
    };
    
    (faqApi.createFAQ as any).mockResolvedValue(newFAQ);
    
    const { result } = renderHook(() => useFAQLogic());
    
    await result.current.createFAQ(newFAQ);
    
    expect(faqApi.createFAQ).toHaveBeenCalledWith(newFAQ);
  });

  it('should handle search functionality', async () => {
    const searchResults = [mockFAQs[0]];
    (faqApi.searchFAQSemanticly as any).mockResolvedValue(searchResults);
    
    const { result } = renderHook(() => useFAQLogic());
    
    await result.current.searchFAQs('test query');
    
    expect(faqApi.searchFAQSemanticly).toHaveBeenCalledWith('test query');
  });

  it('should clear search results', () => {
    const { result } = renderHook(() => useFAQLogic());
    
    result.current.clearSearch();
    
    expect(result.current.searchResults).toEqual([]);
  });
}); 
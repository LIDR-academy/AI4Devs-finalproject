import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { faqApi } from '../../../src/api/faqApi';
import { FAQList } from '../../../src/components/admin/FAQList';

// Mock the API
vi.mock('../../../src/api/faqApi', () => ({
  faqApi: {
    getFAQs: vi.fn(),
    deleteFAQ: vi.fn(),
    generateEmbeddingsForAllFAQs: vi.fn(),
  }
}));

// Mock toast
vi.mock('../../../src/components/ui/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock the FAQ logic hook
vi.mock('../../../src/hooks/useFAQLogic', () => ({
  default: () => ({
    faqs: [
      { id: '1', question: 'Test FAQ 1', answer: 'Answer 1', isActive: true },
      { id: '2', question: 'Test FAQ 2', answer: 'Answer 2', isActive: false }
    ],
    loading: false,
    searchTerm: '',
    setSearchTerm: vi.fn(),
    loadFAQs: vi.fn(),
    createFAQ: vi.fn(),
    updateFAQ: vi.fn(),
    deleteFAQ: vi.fn(),
    generateEmbeddings: vi.fn(),
    clearSearch: vi.fn()
  })
}));

const mockFAQs = [
  {
    id: '1',
    question: 'What are your shipping options?',
    answer: 'We offer standard and express shipping.',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to most European countries.',
    isActive: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

describe('FAQList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (faqApi.getFAQs as any).mockResolvedValue({
      data: mockFAQs,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      }
    });
  });

  it('should render without crashing', async () => {
    render(<FAQList />);
    
    // Check if main elements are present
    expect(screen.getByText('FAQs')).toBeInTheDocument();
    expect(screen.getByText('Manage frequently asked questions and AI embeddings')).toBeInTheDocument();
  });

  it('should display FAQ list after loading', async () => {
    render(<FAQList />);
    
    await waitFor(() => {
      expect(screen.getByText('What are your shipping options?')).toBeInTheDocument();
      expect(screen.getByText('Do you ship internationally?')).toBeInTheDocument();
    });
  });

  it('should show correct status badges', async () => {
    render(<FAQList />);
    
    await waitFor(() => {
      const activeStatus = screen.getByText('Active');
      const inactiveStatus = screen.getByText('Inactive');
      
      expect(activeStatus).toBeInTheDocument();
      expect(inactiveStatus).toBeInTheDocument();
    });
  });

  it('should have search functionality', async () => {
    render(<FAQList />);
    
    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    expect(searchInput).toBeInTheDocument();
    
    // Test search input
    fireEvent.change(searchInput, { target: { value: 'shipping' } });
    expect(searchInput).toHaveValue('shipping');
  });

  it('should have Add FAQ button', () => {
    render(<FAQList />);
    
    const addButton = screen.getByText('Add FAQ');
    expect(addButton).toBeInTheDocument();
  });

  it('should have Generate Embeddings button', () => {
    render(<FAQList />);
    
    const generateButton = screen.getByText('Generate Embeddings');
    expect(generateButton).toBeInTheDocument();
  });
}); 
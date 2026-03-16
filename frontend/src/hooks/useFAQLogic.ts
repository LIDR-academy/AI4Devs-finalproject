import { toast } from '@/components/ui/use-toast';
import { useCallback, useState } from 'react';
import { faqApi } from '../api/faqApi';
import { CreateFAQDto, FAQ, UpdateFAQDto } from '../types/faq';
import { useApiCall } from './useApiCall';

interface UseFAQLogicReturn {
  faqs: FAQ[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  searchResults: FAQ[];
  searchLoading: boolean;
  loadFAQs: () => Promise<void>;
  createFAQ: (data: CreateFAQDto) => Promise<void>;
  updateFAQ: (id: string, data: UpdateFAQDto) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
  searchFAQs: (query: string) => Promise<void>;
  clearError: () => void;
  clearSearch: () => void;
}

export const useFAQLogic = (): UseFAQLogicReturn => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchResults, setSearchResults] = useState<FAQ[]>([]);

  // API calls with retry logic
  const {
    loading,
    error,
    execute: executeFAQLoad,
    reset: resetFAQLoad
  } = useApiCall(faqApi.getFAQs, {
    retries: 2,
    onSuccess: (data) => {
      setFaqs(data.faqs || []);
      toast({
        title: "Success",
        description: "FAQs loaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load FAQs",
        variant: "destructive",
      });
    }
  });

  const {
    loading: saving,
    execute: executeCreate
  } = useApiCall(faqApi.createFAQ, {
    retries: 2,
    onSuccess: (newFAQ) => {
      setFaqs(prev => [...prev, newFAQ]);
      toast({
        title: "Success",
        description: "FAQ created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create FAQ",
        variant: "destructive",
      });
    }
  });

  const {
    loading: updating,
    execute: executeUpdate
  } = useApiCall(faqApi.updateFAQ, {
    retries: 2,
    onSuccess: (updatedFAQ) => {
      setFaqs(prev => prev.map(faq => 
        faq.id === updatedFAQ.id ? updatedFAQ : faq
      ));
      toast({
        title: "Success",
        description: "FAQ updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update FAQ",
        variant: "destructive",
      });
    }
  });

  const {
    loading: deleting,
    execute: executeDelete
  } = useApiCall(faqApi.deleteFAQ, {
    retries: 2,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  });

  const {
    loading: searchLoading,
    execute: executeSearch
  } = useApiCall(faqApi.searchFAQSemanticly, {
    retries: 1, // Less retries for search
    onSuccess: (results) => {
      setSearchResults(results);
    },
    onError: () => {
      toast({
        title: "Search Error",
        description: "Failed to search FAQs",
        variant: "destructive",
      });
    }
  });

  // Business logic methods
  const loadFAQs = useCallback(async () => {
    try {
      await executeFAQLoad();
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    }
  }, [executeFAQLoad]);

  const createFAQ = useCallback(async (data: CreateFAQDto) => {
    try {
      await executeCreate(data);
    } catch (error) {
      console.error('Failed to create FAQ:', error);
      throw error;
    }
  }, [executeCreate]);

  const updateFAQ = useCallback(async (id: string, data: UpdateFAQDto) => {
    try {
      await executeUpdate(data);
    } catch (error) {
      console.error('Failed to update FAQ:', error);
      throw error;
    }
  }, [executeUpdate]);

  const deleteFAQ = useCallback(async (id: string) => {
    try {
      await executeDelete(id);
      // Update state after successful deletion
      setFaqs(prev => prev.filter(faq => faq.id !== id));
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      throw error;
    }
  }, [executeDelete]);

  const searchFAQs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      await executeSearch(query);
    } catch (error) {
      console.error('Failed to search FAQs:', error);
    }
  }, [executeSearch]);

  const clearError = useCallback(() => {
    resetFAQLoad();
  }, [resetFAQLoad]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    faqs,
    loading,
    saving: saving || updating,
    deleting,
    error,
    searchResults,
    searchLoading,
    loadFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    searchFAQs,
    clearError,
    clearSearch,
  };
}; 
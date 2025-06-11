import { toast } from '@/components/ui/use-toast';
import { useCallback, useState } from 'react';
import { useApiCall } from './useApiCall';

interface CRUDApi<T, CreateDto, UpdateDto, Filters> {
  getAll: (filters?: Filters, page?: number, limit?: number) => Promise<{
    data: T[];
    pagination: { totalPages: number; currentPage: number; total: number };
  }>;
  create: (data: CreateDto) => Promise<T>;
  update: (id: string, data: UpdateDto) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

interface UseCRUDOptions {
  entityName: string; // "Product", "Service", etc.
  pageSize?: number;
  enableToasts?: boolean;
}

interface UseCRUDReturn<T, CreateDto, UpdateDto, Filters> {
  // Data state
  items: T[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  
  // Filters & Search
  filters: Filters;
  searchTerm: string;
  
  // CRUD operations
  loadItems: () => Promise<void>;
  createItem: (data: CreateDto) => Promise<void>;
  updateItem: (id: string, data: UpdateDto) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // UI state management
  selectedItemId: string | null;
  isEditing: boolean;
  isCreating: boolean;
  
  // UI actions
  setPage: (page: number) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setSearchTerm: (term: string) => void;
  startEdit: (id: string) => void;
  startCreate: () => void;
  cancelEdit: () => void;
  
  // Confirm dialog
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  setConfirmDialog: (dialog: any) => void;
  
  // Utilities
  clearError: () => void;
  refresh: () => Promise<void>;
}

export function useCRUD<T extends { id: string }, CreateDto, UpdateDto, Filters>(
  api: CRUDApi<T, CreateDto, UpdateDto, Filters>,
  options: UseCRUDOptions
): UseCRUDReturn<T, CreateDto, UpdateDto, Filters> {
  
  const { entityName, pageSize = 10, enableToasts = true } = options;
  
  // Core state
  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFiltersState] = useState<Filters>({} as Filters);
  const [searchTerm, setSearchTermState] = useState("");
  
  // UI state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // API calls with retry logic
  const {
    loading,
    error,
    execute: executeLoad,
    reset: resetError
  } = useApiCall(api.getAll, {
    retries: 2,
    onSuccess: (result) => {
      setItems(result.data);
      setTotalPages(result.pagination.totalPages);
      if (enableToasts) {
        toast({
          title: "Success",
          description: `${entityName}s loaded successfully`,
        });
      }
    },
    onError: () => {
      if (enableToasts) {
        toast({
          title: "Error",
          description: `Failed to load ${entityName.toLowerCase()}s`,
          variant: "destructive",
        });
      }
    }
  });

  const {
    execute: executeCreate
  } = useApiCall(api.create, {
    retries: 2,
    onSuccess: (newItem) => {
      setItems(prev => [...prev, newItem]);
      setIsCreating(false);
      if (enableToasts) {
        toast({
          title: "Success",
          description: `${entityName} created successfully`,
        });
      }
    },
    onError: () => {
      if (enableToasts) {
        toast({
          title: "Error",
          description: `Failed to create ${entityName.toLowerCase()}`,
          variant: "destructive",
        });
      }
    }
  });

  const {
    execute: executeUpdate
  } = useApiCall(api.update, {
    retries: 2,
    onSuccess: (updatedItem) => {
      setItems(prev => prev.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
      setIsEditing(false);
      setSelectedItemId(null);
      if (enableToasts) {
        toast({
          title: "Success",
          description: `${entityName} updated successfully`,
        });
      }
    },
    onError: () => {
      if (enableToasts) {
        toast({
          title: "Error",
          description: `Failed to update ${entityName.toLowerCase()}`,
          variant: "destructive",
        });
      }
    }
  });

  const {
    execute: executeDelete
  } = useApiCall(api.delete, {
    retries: 2,
    onSuccess: () => {
      if (enableToasts) {
        toast({
          title: "Success",
          description: `${entityName} deleted successfully`,
        });
      }
    },
    onError: () => {
      if (enableToasts) {
        toast({
          title: "Error",
          description: `Failed to delete ${entityName.toLowerCase()}`,
          variant: "destructive",
        });
      }
    }
  });

  // Business logic methods
  const loadItems = useCallback(async () => {
    try {
      await executeLoad(filters, currentPage, pageSize);
    } catch (error) {
      console.error(`Failed to load ${entityName.toLowerCase()}s:`, error);
    }
  }, [executeLoad, filters, currentPage, pageSize, entityName]);

  const createItem = useCallback(async (data: CreateDto) => {
    try {
      await executeCreate(data);
    } catch (error) {
      console.error(`Failed to create ${entityName.toLowerCase()}:`, error);
      throw error;
    }
  }, [executeCreate, entityName]);

  const updateItem = useCallback(async (id: string, data: UpdateDto) => {
    try {
      await executeUpdate(id, data);
    } catch (error) {
      console.error(`Failed to update ${entityName.toLowerCase()}:`, error);
      throw error;
    }
  }, [executeUpdate, entityName]);

  const deleteItem = useCallback(async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${entityName}`,
      message: `Are you sure you want to delete this ${entityName.toLowerCase()}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await executeDelete(id);
          setItems(prev => prev.filter(item => item.id !== id));
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(`Failed to delete ${entityName.toLowerCase()}:`, error);
        }
      },
    });
  }, [executeDelete, entityName]);

  // UI actions
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setFilters = useCallback((newFilters: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setFilters({ search: term } as unknown as Partial<Filters>);
  }, [setFilters]);

  const startEdit = useCallback((id: string) => {
    setSelectedItemId(id);
    setIsEditing(true);
  }, []);

  const startCreate = useCallback(() => {
    setIsCreating(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedItemId(null);
  }, []);

  const clearError = useCallback(() => {
    resetError();
  }, [resetError]);

  const refresh = useCallback(async () => {
    await loadItems();
  }, [loadItems]);

  return {
    // Data state
    items,
    loading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    
    // Filters & Search
    filters,
    searchTerm,
    
    // CRUD operations
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    
    // UI state
    selectedItemId,
    isEditing,
    isCreating,
    
    // UI actions
    setPage,
    setFilters,
    setSearchTerm,
    startEdit,
    startCreate,
    cancelEdit,
    
    // Confirm dialog
    confirmDialog,
    setConfirmDialog,
    
    // Utilities
    clearError,
    refresh,
  };
} 
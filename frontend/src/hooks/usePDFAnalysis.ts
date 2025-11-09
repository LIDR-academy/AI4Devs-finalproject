/**
 * Custom hooks for PDF Template Analysis state management
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  analyzePDFWithRetry,
  handleAnalysisError,
  validatePDFFile,
} from "../services/pdfAnalysisService";
import { templateService } from "../services/templateService";
import type {
  AnalysisMetadata,
  AnalyzePageState,
  DragState,
  ProgressCallback,
  ResponsiveBreakpoints,
  TemplateField,
  UseAnalyzePageState
} from "../types/pdfAnalysis";

/**
 * Initial state for the analyze page
 */
const INITIAL_STATE: AnalyzePageState = {
  uploadState: "idle",
  selectedFile: null,
  analysisResults: null,
  metadata: null,
  error: null,
  progress: 0,
  showSaveModal: false,
  isSaving: false,
  saveError: null,
};

/**
 * Hook for managing PDF analysis page state
 * @returns State management utilities
 */
export const useAnalyzePageState = (): UseAnalyzePageState => {
  const [state, setState] = useState<AnalyzePageState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<AnalyzePageState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleFileSelect = useCallback((file: File | null) => {
    // If null, clear the selected file (user clicked 'X' button)
    if (file === null) {
      updateState({
        selectedFile: null,
        uploadState: "idle",
        error: null,
        analysisResults: null,
        metadata: null,
      });
      return;
    }

    // Validate the file
    const validation = validatePDFFile(file);

    if (!validation.isValid) {
      updateState({
        uploadState: "error",
        error: validation.error,
        selectedFile: null,
      });
      return;
    }

    updateState({
      selectedFile: file,
      uploadState: "idle",
      error: null,
      analysisResults: null,
      metadata: null,
    });
  }, [updateState]);

  // Track if analysis is in progress to prevent multiple simultaneous calls
  const isAnalyzingRef = useRef(false);

  const handleAnalyze = useCallback(async () => {
    if (!state.selectedFile) return;
    
    // Prevent multiple simultaneous analyze calls
    if (isAnalyzingRef.current) {
      console.warn('[usePDFAnalysis] Analysis already in progress, ignoring duplicate call');
      return;
    }

    isAnalyzingRef.current = true;
    updateState({ uploadState: "uploading", error: null, progress: 0 });

    const onProgress: ProgressCallback = (progress) => {
      updateState({ progress });
      if (progress === 100) {
        updateState({ uploadState: "processing" });
      }
    };

    try {
      const response = await analyzePDFWithRetry(state.selectedFile, onProgress);

      updateState({
        uploadState: "success",
        analysisResults: response.data,
        metadata: response.metadata,
        progress: 100,
      });
    } catch (error) {
      updateState({
        uploadState: "error",
        error: handleAnalysisError(error),
        progress: 0,
      });
    } finally {
      isAnalyzingRef.current = false;
    }
  }, [state.selectedFile, updateState]);

  const handleReset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const handleOpenSaveModal = useCallback(() => {
    updateState({ showSaveModal: true, saveError: null });
  }, [updateState]);

  const handleCloseSaveModal = useCallback(() => {
    updateState({ showSaveModal: false, saveError: null });
  }, [updateState]);

  const handleSaveTemplate = useCallback(
    async (
      data: { name: string; version: string; sepe_url?: string; comment?: string },
      onSuccess?: (versionId: number) => void
    ) => {
      if (!state.selectedFile) {
        updateState({ saveError: "No file selected" });
        return;
      }

      updateState({ isSaving: true, saveError: null });

      try {
        const response = await templateService.ingestTemplate({
          file: state.selectedFile,
          name: data.name,
          version: data.version,
          sepe_url: data.sepe_url,
          comment: data.comment,
        });

        // Success: close modal and reset saving state
        updateState({
          isSaving: false,
          showSaveModal: false,
          saveError: null,
        });

        // Call success callback with version_id for navigation
        if (onSuccess && response.version_id) {
          onSuccess(response.version_id);
        }
      } catch (error) {
        // Handle error - keep modal open for retry
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to save template. Please try again.";

        updateState({
          isSaving: false,
          saveError: errorMessage,
        });
      }
    },
    [state.selectedFile, updateState]
  );

  return {
    state,
    updateState,
    handleFileSelect,
    handleAnalyze,
    handleReset,
    handleOpenSaveModal,
    handleCloseSaveModal,
    handleSaveTemplate,
  };
};

/**
 * Hook for handling file selection and validation
 * @param onFileSelect - Callback when file is selected
 * @param onError - Callback when validation fails
 * @returns File selection handler
 */
export const useFileSelection = (
  onFileSelect: (file: File) => void,
  onError: (error: string) => void
) => {
  const handleFileSelect = useCallback(
    (file: File) => {
      const validation = validatePDFFile(file);

      if (!validation.isValid) {
        onError(validation.error!);
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect, onError]
  );

  return { handleFileSelect };
};

/**
 * Hook for managing drag and drop state
 * @returns Drag state and event handlers
 */
export const useDragAndDrop = () => {
  const [dragState, setDragState] = useState<DragState>({
    isDragOver: false,
    isDragActive: false,
    dragCounter: 0,
  });

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setDragState((prev) => ({
      ...prev,
      dragCounter: prev.dragCounter + 1,
      isDragOver: true,
      isDragActive: true,
    }));
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setDragState((prev) => {
      const newCounter = prev.dragCounter - 1;
      return {
        ...prev,
        dragCounter: newCounter,
        isDragOver: newCounter > 0,
        isDragActive: newCounter > 0,
      };
    });
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setDragState({
      isDragOver: false,
      isDragActive: false,
      dragCounter: 0,
    });

    return event;
  }, []);

  const resetDragState = useCallback(() => {
    setDragState({
      isDragOver: false,
      isDragActive: false,
      dragCounter: 0,
    });
  }, []);

  return {
    dragState,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    resetDragState,
  };
};

/**
 * Hook for handling PDF analysis workflow
 * @param file - File to analyze
 * @param onProgress - Progress callback
 * @param onSuccess - Success callback
 * @param onError - Error callback
 * @returns Analysis control functions
 */
export const usePDFAnalysis = (
  file: File | null,
  onProgress: ProgressCallback,
  onSuccess: (results: TemplateField[], metadata: AnalysisMetadata) => void,
  onError: (error: string) => void
) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startAnalysis = useCallback(async () => {
    if (!file || isAnalyzing) return;

    setIsAnalyzing(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await analyzePDFWithRetry(file, onProgress);
      
      if (response.status === "success") {
        onSuccess(response.data, response.metadata);
      } else {
        onError("Analysis failed. Please try again.");
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        onError(handleAnalysisError(error));
      }
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, [file, isAnalyzing, onProgress, onSuccess, onError]);

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsAnalyzing(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isAnalyzing,
    startAnalysis,
    cancelAnalysis,
  };
};

/**
 * Hook for responsive breakpoint detection
 * @returns Current breakpoint state
 */
export const useResponsiveBreakpoints = (): ResponsiveBreakpoints => {
  const [breakpoints, setBreakpoints] = useState<ResponsiveBreakpoints>({
    mobile: false,
    tablet: false,
    desktop: false,
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        mobile: width < 768,
        tablet: width >= 768 && width < 1024,
        desktop: width >= 1024,
      });
    };

    // Initial check
    updateBreakpoints();

    // Listen for resize events
    window.addEventListener("resize", updateBreakpoints);

    return () => {
      window.removeEventListener("resize", updateBreakpoints);
    };
  }, []);

  return breakpoints;
};

/**
 * Hook for managing table sorting
 * @param initialData - Initial table data
 * @returns Sorted data and sorting controls
 */
export const useTableSorting = <T extends Record<string, any>>(
  initialData: T[]
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });

  const sortData = useCallback(
    (key: keyof T, direction: "asc" | "desc") => {
      const sortedData = [...data].sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        if (aValue < bValue) {
          return direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return direction === "asc" ? 1 : -1;
        }
        return 0;
      });

      setData(sortedData);
      setSortConfig({ key, direction });
    },
    [data]
  );

  const handleSort = useCallback(
    (key: keyof T) => {
      let direction: "asc" | "desc" = "asc";

      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }

      sortData(key, direction);
    },
    [sortConfig, sortData]
  );

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return {
    data,
    sortConfig,
    handleSort,
  };
};

/**
 * Hook for managing focus and keyboard navigation
 * @returns Focus management utilities
 */
export const useFocusManagement = () => {
  const focusElementRef = useRef<HTMLElement | null>(null);

  const setFocusElement = useCallback((element: HTMLElement | null) => {
    focusElementRef.current = element;
  }, []);

  const focusElement = useCallback(() => {
    if (focusElementRef.current) {
      focusElementRef.current.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, onEnter?: () => void, onEscape?: () => void) => {
      switch (event.key) {
        case "Enter":
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case "Escape":
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case "Tab":
          // Allow default tab behavior
          break;
        default:
          break;
      }
    },
    []
  );

  return {
    setFocusElement,
    focusElement,
    handleKeyDown,
  };
};

/**
 * Hook for managing component loading states
 * @returns Loading state utilities
 */
export const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const isLoading = useCallback(
    (key: string): boolean => {
      return loadingStates[key] || false;
    },
    [loadingStates]
  );

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
  };
};

/**
 * Hook for managing error states with auto-clearing
 * @param clearDelay - Delay in ms to auto-clear errors (default: 5000)
 * @returns Error state utilities
 */
export const useErrorState = (clearDelay: number = 5000) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  const setError = useCallback(
    (key: string, error: string) => {
      // Clear existing timeout for this key
      if (timeoutRefs.current[key]) {
        clearTimeout(timeoutRefs.current[key]);
      }

      setErrors((prev) => ({
        ...prev,
        [key]: error,
      }));

      // Set timeout to auto-clear error
      timeoutRefs.current[key] = setTimeout(() => {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
        delete timeoutRefs.current[key];
      }, clearDelay);
    },
    [clearDelay]
  );

  const clearError = useCallback((key: string) => {
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const getError = useCallback(
    (key: string): string | undefined => {
      return errors[key];
    },
    [errors]
  );

  const hasError = useCallback(
    (key: string): boolean => {
      return Boolean(errors[key]);
    },
    [errors]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  return {
    setError,
    clearError,
    getError,
    hasError,
  };
};

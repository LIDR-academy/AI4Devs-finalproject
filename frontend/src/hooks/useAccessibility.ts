import { useCallback, useEffect, useRef, useState } from 'react';

// Focus management hook
export const useFocusManagement = () => {
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const currentFocusIndexRef = useRef(0);

  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    focusableElementsRef.current = focusableElements;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        
        const currentIndex = currentFocusIndexRef.current;
        let nextIndex;

        if (e.shiftKey) {
          nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        } else {
          nextIndex = currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1;
        }

        currentFocusIndexRef.current = nextIndex;
        focusableElements[nextIndex]?.focus();
      }

      if (e.key === 'Escape') {
        // Allow escape to close modals/dialogs
        const escapeEvent = new CustomEvent('escape-pressed');
        container.dispatchEvent(escapeEvent);
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [getFocusableElements]);

  const restoreFocus = useCallback((previouslyFocusedElement: HTMLElement | null) => {
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }, []);

  return { trapFocus, restoreFocus, getFocusableElements };
};

// Screen reader announcements
export const useScreenReader = () => {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcement element if it doesn't exist
    if (!announcementRef.current) {
      const element = document.createElement('div');
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
      element.style.position = 'absolute';
      element.style.left = '-10000px';
      element.style.width = '1px';
      element.style.height = '1px';
      element.style.overflow = 'hidden';
      document.body.appendChild(element);
      announcementRef.current = element;
    }

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return { announce };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (
  items: any[],
  onSelect: (item: any, index: number) => void
) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev < items.length - 1 ? prev + 1 : 0;
          itemRefs.current[next]?.focus();
          return next;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev > 0 ? prev - 1 : items.length - 1;
          itemRefs.current[next]?.focus();
          return next;
        });
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) {
          onSelect(items[activeIndex], activeIndex);
        }
        break;

      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        itemRefs.current[0]?.focus();
        break;

      case 'End':
        e.preventDefault();
        const lastIndex = items.length - 1;
        setActiveIndex(lastIndex);
        itemRefs.current[lastIndex]?.focus();
        break;
    }
  }, [items, activeIndex, onSelect]);

  const setItemRef = useCallback((index: number) => (ref: HTMLElement | null) => {
    itemRefs.current[index] = ref;
  }, []);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    setItemRef,
  };
};

// ARIA attributes generator
export const useAriaAttributes = () => {
  const generateId = useCallback((prefix: string = 'element') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const getComboboxAttributes = useCallback((
    isExpanded: boolean,
    activeDescendant?: string,
    controls?: string
  ) => ({
    role: 'combobox',
    'aria-expanded': isExpanded,
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'list',
    ...(activeDescendant && { 'aria-activedescendant': activeDescendant }),
    ...(controls && { 'aria-controls': controls }),
  }), []);

  const getListboxAttributes = useCallback((labelledBy?: string) => ({
    role: 'listbox',
    ...(labelledBy && { 'aria-labelledby': labelledBy }),
  }), []);

  const getOptionAttributes = useCallback((
    isSelected: boolean,
    isActive: boolean,
    id: string
  ) => ({
    role: 'option',
    'aria-selected': isSelected,
    id,
    ...(isActive && { 'aria-current': 'true' }),
  }), []);

  const getDialogAttributes = useCallback((
    labelledBy?: string,
    describedBy?: string
  ) => ({
    role: 'dialog',
    'aria-modal': 'true',
    ...(labelledBy && { 'aria-labelledby': labelledBy }),
    ...(describedBy && { 'aria-describedby': describedBy }),
  }), []);

  const getButtonAttributes = useCallback((
    isPressed?: boolean,
    controls?: string,
    expanded?: boolean
  ) => ({
    type: 'button' as const,
    ...(isPressed !== undefined && { 'aria-pressed': isPressed }),
    ...(controls && { 'aria-controls': controls }),
    ...(expanded !== undefined && { 'aria-expanded': expanded }),
  }), []);

  return {
    generateId,
    getComboboxAttributes,
    getListboxAttributes,
    getOptionAttributes,
    getDialogAttributes,
    getButtonAttributes,
  };
};

// Color contrast checker
export const useColorContrast = () => {
  const checkContrast = useCallback((foreground: string, background: string): {
    ratio: number;
    level: 'AAA' | 'AA' | 'FAIL';
  } => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Calculate relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);

    if (!fg || !bg) {
      return { ratio: 0, level: 'FAIL' };
    }

    const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
    const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                  (Math.min(fgLuminance, bgLuminance) + 0.05);

    let level: 'AAA' | 'AA' | 'FAIL';
    if (ratio >= 7) {
      level = 'AAA';
    } else if (ratio >= 4.5) {
      level = 'AA';
    } else {
      level = 'FAIL';
    }

    return { ratio: Math.round(ratio * 100) / 100, level };
  }, []);

  return { checkContrast };
};

// Reduced motion detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}; 
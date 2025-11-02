import { useEffect, RefObject } from 'react';

/**
 * Hook to handle Escape key for closing modals/dialogs
 */
export const useEscapeKey = (onEscape: () => void, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onEscape, isActive]);
};

/**
 * Hook to trap focus within a modal/dialog
 */
export const useFocusTrap = (containerRef: RefObject<HTMLElement>, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element when modal opens
    firstElement?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [containerRef, isActive]);
};

/**
 * Hook for arrow key navigation in lists/menus
 */
export const useArrowNavigation = (
  itemsRef: RefObject<HTMLElement[]>,
  isActive: boolean = true
) => {
  useEffect(() => {
    if (!isActive || !itemsRef.current) return;

    const items = itemsRef.current;
    let currentIndex = 0;

    const handleArrowKey = (event: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return;
      }

      event.preventDefault();

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % items.length;
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
      }

      items[currentIndex]?.focus();
    };

    items.forEach((item, index) => {
      item?.addEventListener('focus', () => {
        currentIndex = index;
      });
    });

    document.addEventListener('keydown', handleArrowKey);
    return () => document.removeEventListener('keydown', handleArrowKey);
  }, [itemsRef, isActive]);
};

/**
 * Hook to handle Enter and Space key for custom interactive elements
 */
export const useClickableKey = (
  elementRef: RefObject<HTMLElement>,
  onClick: () => void,
  isActive: boolean = true
) => {
  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    };

    element.addEventListener('keydown', handleKeyPress);
    return () => element.removeEventListener('keydown', handleKeyPress);
  }, [elementRef, onClick, isActive]);
};

/**
 * Hook to restore focus when component unmounts
 */
export const useRestoreFocus = (isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return;

    const previouslyFocused = document.activeElement as HTMLElement;

    return () => {
      // Restore focus when component unmounts
      previouslyFocused?.focus();
    };
  }, [isActive]);
};

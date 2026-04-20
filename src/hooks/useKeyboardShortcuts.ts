/**
 * useKeyboardShortcuts Hook
 *
 * Provides keyboard shortcut functionality for improved accessibility
 * and user experience. Supports common shortcuts like:
 * - Ctrl/Cmd + S: Save
 * - Escape: Close/Cancel
 * - Tab: Navigate between elements
 * - Arrow keys: Navigate lists/options
 */

"use client";

import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Command key on Mac
  callback: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

export const useKeyboardShortcuts = ({
  enabled = true,
  shortcuts,
}: UseKeyboardShortcutsOptions) => {
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcutsRef.current) {
        const {
          key,
          ctrl = false,
          shift = false,
          alt = false,
          meta = false,
          callback,
          preventDefault = true,
        } = shortcut;

        // Check if key matches
        const keyMatches = event.key.toLowerCase() === key.toLowerCase();

        // Check modifiers
        const ctrlMatches = ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shift ? event.shiftKey : !event.shiftKey;
        const altMatches = alt ? event.altKey : !event.altKey;
        const metaMatches = meta ? event.metaKey : true; // Meta is optional

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback(event);
          break; // Stop after first match
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
};

/**
 * useFocusTrap Hook
 *
 * Traps focus within a container for modal dialogs and overlays
 * Ensures keyboard navigation stays within the modal
 */
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean = true
) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

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

    container.addEventListener("keydown", handleTabKey);

    // Focus first element when trap activates
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [containerRef, isActive]);
};

/**
 * useArrowNavigation Hook
 *
 * Provides arrow key navigation for lists and grids
 */
interface UseArrowNavigationOptions {
  itemsCount: number;
  columns?: number; // For grid navigation
  onSelect?: (index: number) => void;
  enabled?: boolean;
  loop?: boolean; // Whether to loop from end to start
}

export const useArrowNavigation = ({
  itemsCount,
  columns = 1,
  onSelect,
  enabled = true,
  loop = true,
}: UseArrowNavigationOptions) => {
  const currentIndexRef = useRef(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || itemsCount === 0) return;

      let newIndex = currentIndexRef.current;
      let handled = false;

      switch (event.key) {
        case "ArrowDown":
          newIndex = currentIndexRef.current + columns;
          if (newIndex >= itemsCount) {
            newIndex = loop ? newIndex % itemsCount : currentIndexRef.current;
          }
          handled = true;
          break;

        case "ArrowUp":
          newIndex = currentIndexRef.current - columns;
          if (newIndex < 0) {
            newIndex = loop ? itemsCount + newIndex : currentIndexRef.current;
          }
          handled = true;
          break;

        case "ArrowRight":
          if (columns > 1) {
            newIndex = currentIndexRef.current + 1;
            if (newIndex >= itemsCount) {
              newIndex = loop ? 0 : currentIndexRef.current;
            }
            handled = true;
          }
          break;

        case "ArrowLeft":
          if (columns > 1) {
            newIndex = currentIndexRef.current - 1;
            if (newIndex < 0) {
              newIndex = loop ? itemsCount - 1 : currentIndexRef.current;
            }
            handled = true;
          }
          break;

        case "Home":
          newIndex = 0;
          handled = true;
          break;

        case "End":
          newIndex = itemsCount - 1;
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        currentIndexRef.current = newIndex;
        onSelect?.(newIndex);
      }
    },
    [enabled, itemsCount, columns, loop, onSelect]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    currentIndex: currentIndexRef.current,
    setCurrentIndex: (index: number) => {
      currentIndexRef.current = index;
    },
  };
};

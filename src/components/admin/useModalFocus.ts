'use client';

import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

function visible(element: HTMLElement): boolean {
  return element.getClientRects().length > 0;
}

export function focusableIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(visible);
}

interface ModalFocusOptions {
  /** Element to focus on open; defaults to the first focusable, then the container. */
  initialFocus?: () => HTMLElement | null;
  /** Called on Escape. */
  onEscape: () => void;
  /** Focus target on close when the opener is gone. */
  fallbackFocus?: () => HTMLElement | null;
}

/**
 * Shared modal behaviour for admin dialogs and drawers: initial focus, Tab
 * kept inside the container, Escape, page scroll lock while open, and focus
 * returned to the opener on close. Attach the returned handler to the
 * container's onKeyDown (a React handler, so nested dialogs can stop it).
 */
export function useModalFocus(
  ref: RefObject<HTMLElement | null>,
  { initialFocus, onEscape, fallbackFocus }: ModalFocusOptions
): (event: KeyboardEvent<HTMLElement>) => void {
  const optionsRef = useRef({ initialFocus, onEscape, fallbackFocus });
  useEffect(() => {
    optionsRef.current = { initialFocus, onEscape, fallbackFocus };
  }, [initialFocus, onEscape, fallbackFocus]);

  useEffect(() => {
    const container = ref.current;
    const active = document.activeElement;
    const opener = active instanceof HTMLElement && active !== document.body ? active : null;
    if (container) {
      const target = optionsRef.current.initialFocus?.() ?? focusableIn(container)[0] ?? container;
      target.focus();
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const options = optionsRef;
    return () => {
      document.body.style.overflow = previousOverflow;
      const back = opener && opener.isConnected ? opener : options.current.fallbackFocus?.();
      back?.focus();
    };
  }, [ref]);

  return (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      optionsRef.current.onEscape();
      return;
    }
    if (event.key !== 'Tab') return;
    const container = ref.current;
    if (!container) return;
    const items = focusableIn(container);
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === container || !container.contains(active))) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && (active === last || !container.contains(active))) {
      event.preventDefault();
      first?.focus();
    }
  };
}

import { useEffect, useRef, useCallback } from "react";

/**
 * Accessible modal baseline. [F1.7 / P5-9]
 *
 * The reusable dialog every modal in the app should mount inside. Guarantees the
 * WCAG 2.2 AA behaviours that are definition-of-done per the design rules:
 *   - role="dialog" + aria-modal, labelled by `title` (or `ariaLabel`)
 *   - focus moves into the dialog on open and is TRAPPED (Tab/Shift+Tab cycle)
 *   - Esc closes
 *   - focus is RESTORED to the trigger element on close
 *   - backdrop click closes; content click does not
 *
 * Usage:
 *   {open && (
 *     <Modal title="Log a book" onClose={() => setOpen(false)}>
 *       ...content...
 *     </Modal>
 *   )}
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  onClose,
  title,
  ariaLabel,
  children,
  className = "",
  backdropClassName = "",
  closeOnBackdrop = true,
}) {
  const cardRef = useRef(null);
  // The element focused before the modal opened, so we can restore it on close.
  const previouslyFocused = useRef(null);

  const focusables = useCallback(() => {
    if (!cardRef.current) return [];
    return Array.from(cardRef.current.querySelectorAll(FOCUSABLE));
  }, []);

  // Move focus into the dialog on mount; restore it on unmount.
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    const els = focusables();
    (els[0] || cardRef.current)?.focus();

    return () => {
      const prev = previouslyFocused.current;
      if (prev && typeof prev.focus === "function") prev.focus();
    };
  }, [focusables]);

  // Keyboard: Esc closes, Tab is trapped within the dialog.
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose?.();
      return;
    }
    if (e.key !== "Tab") return;

    const els = focusables();
    if (els.length === 0) {
      e.preventDefault();
      return;
    }
    const first = els[0];
    const last = els[els.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && (active === first || !cardRef.current.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const titleId = title ? "modal-title" : undefined;

  return (
    <div
      className={`modal-backdrop ${backdropClassName}`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={cardRef}
        className={`modal-card ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={titleId ? undefined : ariaLabel}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        {title && (
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

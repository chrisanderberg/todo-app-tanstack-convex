import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

type SlideOverProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function SlideOver({ open, onClose, children }: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  function getFocusableElements(panel: HTMLDivElement) {
    return Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (element) =>
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-hidden') !== 'true',
    )
  }

  useEffect(() => {
    if (!open || !panelRef.current) return

    const panel = panelRef.current
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusables = getFocusableElements(panel)
    ;(focusables[0] ?? panel).focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const tabbable = getFocusableElements(panel)
      if (tabbable.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }

      const first = tabbable[0]
      const last = tabbable[tabbable.length - 1]
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || active === panel) {
          event.preventDefault()
          last.focus()
        }
        return
      }

      if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
      previousFocusRef.current = null
    }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="slideover-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="slideover-panel"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <button
          className="absolute right-4 top-4 z-10 rounded-md p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </>
  )
}

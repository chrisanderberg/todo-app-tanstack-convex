import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

type SlideOverProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function SlideOver({ open, onClose, children }: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Trap focus within panel when open
  useEffect(() => {
    if (open && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
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

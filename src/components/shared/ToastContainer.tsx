import { useEffect } from 'react'
import { useToastStore } from '../../store/toastStore'

const VARIANT_CLASSES: Record<string, string> = {
  success: 'text-bg-success',
  danger:  'text-bg-danger',
  info:    'text-bg-info',
}

const VARIANT_ICONS: Record<string, string> = {
  success: '✓',
  danger:  '✕',
  info:    'ℹ',
}

function ToastItem({ id, message, variant }: { id: string; message: string; variant: string }) {
  const removeToast = useToastStore((s) => s.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), 4000)
    return () => clearTimeout(timer)
  }, [id, removeToast])

  return (
    <div
      className={`toast show d-flex align-items-center border-0 ${VARIANT_CLASSES[variant] ?? 'text-bg-secondary'}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="toast-body d-flex align-items-center gap-2">
        <span className="fw-bold">{VARIANT_ICONS[variant]}</span>
        {message}
      </div>
      <button
        type="button"
        className="btn-close btn-close-white me-2 ms-auto"
        aria-label="Close"
        onClick={() => removeToast(id)}
      />
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="toast-container position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 1100 }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} message={t.message} variant={t.variant} />
      ))}
    </div>
  )
}

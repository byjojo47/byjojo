import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/35 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-sand bg-white shadow-[0_30px_90px_rgba(47,43,37,0.22)]">
        <div className="flex items-start gap-4 border-b border-sand/70 bg-ivory/80 p-5">
          <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isDanger ? 'bg-red-50 text-red-700' : 'bg-sage/15 text-olive'}`}>
            <AlertTriangle className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-3xl leading-tight text-charcoal">{title}</h2>
            {message && <p className="mt-2 text-sm leading-6 text-charcoal/62">{message}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-charcoal/55 transition hover:text-olive"
            aria-label={cancelLabel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary justify-center">
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition ${
              isDanger
                ? 'bg-red-700 text-white hover:bg-red-800'
                : 'bg-olive text-white hover:bg-charcoal'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

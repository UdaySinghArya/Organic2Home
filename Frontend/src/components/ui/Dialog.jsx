import Button from './Button.jsx';

export default function Dialog({ open, title, children, confirmLabel = 'Confirm', onConfirm, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(31,42,34,0.4)] p-4 sm:items-center">
      <div className="w-full max-w-md rounded-[20px] bg-surface-lowest p-5 shadow-[0_20px_40px_-8px_rgba(31,42,34,0.16)]">
        <h2 className="ks-title">{title}</h2>
        <div className="ks-body mt-2 text-on-surface-variant">{children}</div>
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="cta" className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

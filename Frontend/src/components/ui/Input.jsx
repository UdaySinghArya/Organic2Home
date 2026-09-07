export default function Input({ label, error, hint, className = '', ...props }) {
  return (
    <label className={`flex w-full flex-col gap-1 ${className}`}>
      {label ? <span className="ks-label text-on-surface-variant">{label}</span> : null}
      <input
        className={`h-12 w-full rounded-full border bg-surface-lowest px-5 text-[16px] font-medium text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary ${
          error ? 'border-error' : 'border-outline-soft'
        }`}
        {...props}
      />
      {error ? <span className="text-[12px] font-medium text-secondary">{error}</span> : null}
      {hint && !error ? <span className="ks-caption text-outline">{hint}</span> : null}
    </label>
  );
}

export function TextArea({ label, className = '', ...props }) {
  return (
    <label className={`flex w-full flex-col gap-1 ${className}`}>
      {label ? <span className="ks-label text-on-surface-variant">{label}</span> : null}
      <textarea
        className="min-h-24 w-full rounded-2xl border border-outline-soft bg-surface-lowest px-4 py-3 text-[16px] font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary"
        {...props}
      />
    </label>
  );
}

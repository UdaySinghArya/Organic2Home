const variants = {
  cta: 'bg-secondary-container text-white hover:opacity-95',
  harvest: 'bg-secondary text-on-secondary hover:opacity-95',
  primary: 'bg-primary text-white',
  secondary: 'bg-surface-lowest text-primary border-2 border-primary',
  ghost: 'bg-transparent text-on-surface',
  danger: 'bg-error text-white',
};

export default function Button({
  children,
  variant = 'cta',
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-bold transition active:scale-[0.99] disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

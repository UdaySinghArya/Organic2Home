const variants = {
  cta: 'bg-secondary-container text-white hover:opacity-95',
  harvest: 'bg-secondary text-on-secondary hover:opacity-95',
  primary: 'bg-primary text-white',
  secondary: 'bg-surface-lowest text-primary border-2 border-primary',
  ghost: 'bg-transparent text-on-surface',
  danger: 'bg-error text-white',
};

const sizes = {
  md: 'min-h-12 px-5 text-[15px] gap-2',
  sm: 'h-8 min-h-8 px-3 text-[13px] gap-0.5',
};

export default function Button({
  children,
  variant = 'cta',
  size = 'md',
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold transition active:scale-[0.99] disabled:opacity-50 ${sizes[size] || sizes.md} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

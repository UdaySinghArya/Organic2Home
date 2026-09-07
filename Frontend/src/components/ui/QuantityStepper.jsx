import Icon from './Icon.jsx';

export default function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  suffix = '',
  disabled = false,
  size = 'md',
  className = '',
}) {
  const btn = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const text = size === 'lg' ? 'min-w-16 text-[18px]' : size === 'sm' ? 'min-w-5 text-[13px]' : 'min-w-6 text-[14px]';

  return (
    <div className={`inline-flex items-center rounded-full bg-surface-low p-1 ${disabled ? 'opacity-50' : ''} ${className}`}>
      <button
        type="button"
        aria-label="Decrease"
        disabled={disabled || value <= min}
        className={`flex items-center justify-center rounded-full bg-surface-lowest text-on-surface shadow-sm disabled:opacity-40 ${btn}`}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Icon name="remove" size={size === 'lg' ? 20 : 18} />
      </button>
      <span className={`px-2 text-center font-extrabold ${text}`}>
        {value}
        {suffix ? ` ${suffix}` : ''}
      </span>
      <button
        type="button"
        aria-label="Increase"
        disabled={disabled || value >= max}
        className={`flex items-center justify-center rounded-full bg-primary text-white shadow-sm disabled:opacity-40 ${btn}`}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Icon name="add" size={size === 'lg' ? 20 : 18} />
      </button>
    </div>
  );
}

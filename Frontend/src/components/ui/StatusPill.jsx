const styles = {
  PLACED: 'bg-[#F3EFE6] text-[#5A6258]',
  CONFIRMED: 'bg-primary-fixed text-on-primary-fixed',
  HARVESTING: 'bg-[#F5C542] text-[#7C4A00]',
  PACKED: 'bg-surface-container text-on-surface',
  OUT_FOR_DELIVERY: 'bg-primary text-white',
  DELIVERED: 'bg-[#E6F4EA] text-[#2F8F4E]',
  CANCELLED: 'bg-error-container text-error',
  PENDING: 'bg-tertiary-fixed text-on-tertiary-fixed',
  PICKED: 'bg-primary-fixed text-on-primary-fixed',
  SUCCESS: 'bg-[#E6F4EA] text-[#2F8F4E]',
  FAILED: 'bg-error-container text-error',
  REFUNDED: 'bg-surface-low text-on-surface-variant',
  ACTIVE: 'bg-primary text-white',
  RESTING: 'bg-surface-low text-on-surface-variant',
  OUT_OF_STOCK: 'bg-error-container text-error',
};

const labels = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  HARVESTING: 'Harvesting',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  PENDING: 'Pending',
  PICKED: 'Picked',
  SUCCESS: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  ACTIVE: 'Active',
  RESTING: 'Resting',
  OUT_OF_STOCK: 'Out of stock',
};

export default function StatusPill({ status, className = '' }) {
  const key = String(status || '');
  const label = labels[key] || key.replaceAll('_', ' ');
  const showCheck = key === 'DELIVERED' || key === 'SUCCESS';
  const showDot = ['HARVESTING', 'PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'PENDING', 'PICKED'].includes(key);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold ${
        styles[key] || styles.PLACED
      } ${className}`}
    >
      {showCheck ? (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      {showDot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {label}
    </span>
  );
}

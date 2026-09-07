export default function Chip({ children, active = false, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-[13px] font-bold transition ${
        active
          ? 'bg-primary text-white shadow-sm'
          : 'border border-outline-soft bg-surface-lowest text-on-surface'
      } ${className}`}
    >
      {children}
    </button>
  );
}

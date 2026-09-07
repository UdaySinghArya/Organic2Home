export default function Card({ children, className = '', padded = true }) {
  return (
    <div
      className={`rounded-[20px] border border-outline-soft bg-surface-lowest shadow-[0_4px_16px_-2px_rgba(60,40,10,0.05)] ${
        padded ? 'p-4' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

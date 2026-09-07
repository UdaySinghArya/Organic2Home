import Icon from '../ui/Icon.jsx';

export default function CutoffBar({ className = '' }) {
  return (
    <div
      className={`mb-5 hidden items-center justify-between gap-3 rounded-full bg-tertiary-fixed/70 px-4 py-2 md:flex ${className}`}
    >
      <p className="flex items-center gap-2 text-[12px] font-medium text-on-surface">
        <Icon name="wb_sunny" size={16} filled className="text-tertiary" />
        Daily harvest cutoff: <strong className="font-bold">8:00 PM tonight</strong>
        <span className="hidden text-on-surface-variant lg:inline">• Lock your crate for tomorrow 7–10 AM</span>
      </p>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-lowest px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider text-primary uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Orders open
      </span>
    </div>
  );
}

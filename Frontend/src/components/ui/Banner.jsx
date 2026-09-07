import Icon from './Icon.jsx';

export default function Banner({ title, subtitle, badge, icon = 'wb_sunny', className = '' }) {
  return (
    <section
      className={`flex items-center justify-between gap-3 rounded-[20px] bg-tertiary-fixed/90 p-4 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-lowest text-tertiary">
          <Icon name={icon} size={20} filled />
        </div>
        <div>
          <p className="text-[15px] font-bold leading-tight text-on-tertiary-fixed">{title}</p>
          {subtitle ? <p className="ks-caption text-on-surface-variant">{subtitle}</p> : null}
        </div>
      </div>
      {badge ? <span className="ks-label shrink-0 rounded-full bg-tertiary-container/20 px-2.5 py-1 text-tertiary">{badge}</span> : null}
    </section>
  );
}

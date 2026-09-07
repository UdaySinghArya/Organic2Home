import Icon from './Icon.jsx';

const tones = {
  yellow: 'bg-tertiary-fixed text-on-tertiary-fixed',
  green: 'bg-primary-fixed text-on-primary-fixed',
  white: 'bg-surface-lowest text-on-surface border border-outline-soft',
};

export default function Badge({ children, tone = 'yellow', icon, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${tones[tone]} ${className}`}>
      {icon ? <Icon name={icon} size={13} filled /> : null}
      <span className="ks-label">{children}</span>
    </span>
  );
}

export function KalAayegaBadge({ className = '', children = 'Kal aayega' }) {
  return (
    <Badge tone="yellow" icon="wb_sunny" className={className}>
      {children}
    </Badge>
  );
}

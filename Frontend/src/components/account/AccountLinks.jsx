import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { ACCOUNT_LINKS } from '../../lib/accountLinks.js';

export default function AccountLinks({ variant = 'mobile', extras = {} }) {
  const navigate = useNavigate();

  if (variant === 'desktop') {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {ACCOUNT_LINKS.map((row) => (
          <button
            key={row.to}
            type="button"
            className="group flex items-center justify-between rounded-[20px] bg-surface-lowest p-6 text-left shadow-card"
            onClick={() => navigate(row.to)}
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary">
                <Icon name={row.icon} size={24} />
              </span>
              <div>
                <p className="text-[17px] font-semibold">{row.desktopLabel}</p>
                <p className="text-[12px] text-on-surface-variant">{extras[row.to] || row.desktopBody}</p>
              </div>
            </div>
            <Icon name="chevron_right" size={22} className="text-on-surface-variant group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-surface-container overflow-hidden rounded-[20px] bg-surface-lowest shadow-card">
      {ACCOUNT_LINKS.map((row) => (
        <button
          key={row.to}
          type="button"
          className="flex w-full items-center justify-between p-5 text-left hover:bg-surface-low"
          onClick={() => navigate(row.to)}
        >
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
              <Icon name={row.icon} size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[17px] font-semibold">{row.label}</p>
              <p className="text-[12px] text-on-surface-variant">{extras[row.to] || row.body}</p>
            </div>
          </div>
          <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
        </button>
      ))}
    </div>
  );
}

import Icon from '../ui/Icon.jsx';
import { firstName } from '../../lib/format.js';
import { formatDisplayPhone, nameInitial } from '../../lib/phone.js';

export default function ProfileHero({ profile, variant = 'mobile', onLogout }) {
  const name = profile?.name || 'Member';
  const initial = nameInitial(name);

  if (variant === 'desktop') {
    return (
      <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[20px] bg-surface-lowest p-8 shadow-card md:flex-row md:items-center">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-surface-low opacity-60" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-[40px] font-extrabold text-white shadow-sm">
            {initial}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="ks-headline">{name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-extrabold tracking-wider text-primary uppercase">
                <Icon name="verified" size={14} filled />
                Member
              </span>
            </div>
            <p className="mt-1 text-[14px] text-on-surface-variant">{formatDisplayPhone(profile?.phone)}</p>
            <p className="ks-caption mt-0.5 text-outline">Soil-to-doorstep subscriber</p>
            {profile?.email ? <p className="ks-caption mt-0.5 text-outline">{profile.email}</p> : null}
          </div>
        </div>
        {onLogout ? (
          <button
            type="button"
            className="relative z-10 inline-flex items-center gap-2 rounded-full bg-surface-low px-5 py-2.5 text-[13px] font-bold"
            onClick={onLogout}
          >
            <Icon name="logout" size={18} className="text-secondary" />
            Log Out
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative mb-5 overflow-hidden rounded-[20px] bg-surface-low p-5 shadow-sm">
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-primary-fixed/30 blur-2xl" />
      <div className="relative z-10 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container shadow-sm">
            <span className="text-[24px] font-extrabold text-primary">{initial}</span>
          </div>
          <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container shadow-sm">
            <Icon name="eco" size={14} filled className="text-white" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="ks-title truncate">{firstName(name)}</h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold tracking-wider text-primary uppercase">
              Fresh Member
            </span>
          </div>
          <p className="mt-0.5 text-[14px] text-on-surface-variant">{formatDisplayPhone(profile?.phone)}</p>
        </div>
      </div>
    </div>
  );
}

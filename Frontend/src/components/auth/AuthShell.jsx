import { useNavigate } from 'react-router-dom';
import { LOGO_SRC as LOGO, BRAND_NAME } from '../../lib/brand.js';
import { digitsOnly } from '../../lib/phone.js';
import Icon from '../ui/Icon.jsx';

export default function AuthShell({ title, subtitle, children, onBack, brand = 'logo' }) {
  const navigate = useNavigate();

  return (
    <main className="ks-page pt-safe pb-safe">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-4 pb-10 md:max-w-[480px] md:pt-6">
        <div className="flex items-center justify-between py-3">
          <button
            type="button"
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-lowest shadow-sm"
            onClick={onBack || (() => navigate(-1))}
          >
            <Icon name="arrow_back" size={20} />
          </button>
          {brand === 'direct' ? (
            <div className="flex items-center gap-1.5 rounded-full bg-surface-low px-3 py-1">
              <Icon name="eco" size={18} filled className="text-primary" />
              <span className="text-[11px] font-extrabold tracking-wider text-primary uppercase">{BRAND_NAME} Direct</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface-lowest p-1 shadow-sm">
                <img alt={BRAND_NAME} className="h-full w-full rounded-full object-contain" src={LOGO} />
              </div>
              <span className="text-[17px] font-extrabold tracking-tight">
                Organic<span className="text-primary">2</span>Home
              </span>
            </div>
          )}
          <div className="h-10 w-10" />
        </div>
        <h1 className="ks-headline mt-2">{title}</h1>
        {subtitle ? (
          <div className="ks-body mt-1 text-on-surface-variant">{subtitle}</div>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export function PhoneField({ value, onChange, error, variant = 'login' }) {
  const loginStyle = variant === 'login';

  return (
    <div>
      <label className="text-[15px] font-bold" htmlFor="phone-input">
        {loginStyle ? 'Mobile Phone Number' : 'Phone Number'}
      </label>
      <div className="relative mt-2 flex items-center rounded-full bg-surface-low px-4 py-3.5 focus-within:bg-surface-lowest focus-within:shadow-sm">
        {loginStyle ? <Icon name="call" size={20} className="mr-2 text-outline" /> : null}
        <span className="pr-2 text-[13px] font-bold select-none">+91</span>
        <div className="mr-3 h-5 w-px bg-outline/40" />
        <input
          id="phone-input"
          className="w-full bg-transparent text-[18px] font-extrabold tracking-wide outline-none placeholder:font-medium placeholder:text-outline"
          inputMode="numeric"
          autoComplete="tel"
          name="phone"
          type="tel"
          maxLength={10}
          placeholder="98765 43210"
          value={value}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(digitsOnly(e.target.value))}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear phone number"
            className="p-1 text-outline"
            onClick={() => onChange('')}
          >
            <Icon name="cancel" size={18} />
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-secondary">
          <Icon name="info" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

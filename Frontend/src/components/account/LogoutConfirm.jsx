import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { BRAND_NAME } from '../../lib/brand.js';

export default function LogoutConfirm({ open, busy = false, onClose, onConfirm, variant = 'customer' }) {
  if (!open) return null;

  const farmer = variant === 'farmer';
v
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-inverse-surface/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <button type="button" aria-label="Dismiss" className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[420px] rounded-t-[28px] bg-surface-lowest px-5 pt-3 pb-6 text-center shadow-xl sm:rounded-[20px] sm:p-8">
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-surface-container sm:hidden" />
        {farmer ? (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
            <Icon name="logout" size={32} />
          </div>
        ) : (
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
            <Icon name="wb_twilight" size={28} className="text-primary" />
            <span className="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container text-white shadow-sm">
              <Icon name="eco" size={14} filled />
            </span>
          </div>
        )}
        <h2 className="ks-headline">{farmer ? 'Log out of farmer account?' : `Log out of ${BRAND_NAME}?`}</h2>
        <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-relaxed text-on-surface-variant">
          {farmer
            ? "You will need to verify OTP to update tomorrow's harvest counts."
            : 'You will need to enter your phone number to sign back in.'}
        </p>
        {farmer ? null : (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface-low px-4 py-3 text-left">
            <Icon name="light_mode" size={20} filled className="shrink-0 text-tertiary-container" />
            <p className="text-[12px] leading-snug text-on-surface-variant">
              Your scheduled morning harvests and vegetable cart remain safely preserved for your next dawn visit.
            </p>
          </div>
        )}
        <div className="mt-6 flex w-full flex-col gap-3">
          <Button className="w-full" disabled={busy} onClick={onConfirm}>
            {farmer ? null : <Icon name="logout" size={18} />}
            {busy ? 'Signing out…' : 'Log out'}
          </Button>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded-full text-[15px] font-bold text-on-surface hover:bg-surface-container"
            onClick={onClose}
          >
            Stay
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FarmerShell from '../../components/layout/FarmerShell.jsx';
import LogoutConfirm from '../../components/account/LogoutConfirm.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { farmNameOf, farmPlaceOf } from '../../lib/farmerUi.js';
import { formatDisplayPhone } from '../../lib/phone.js';
import { paths } from '../../lib/paths.js';

export default function FarmerProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const farmName = farmNameOf(user);
  const place = farmPlaceOf(user);

  async function confirmLogout() {
    setBusy(true);
    await logout();
    navigate(paths.farmerLogin, { replace: true });
  }

  return (
    <FarmerShell>
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex items-center justify-between pt-2">
          <div>
            <h1 className="ks-headline tracking-tight">Farmer Profile</h1>
            <p className="mt-1 text-[12px] text-on-surface-variant">Manage your farm operations & credentials</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-primary">
            <Icon name="badge" size={22} />
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[20px] bg-surface-lowest p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                <Icon name="agriculture" size={32} />
              </div>
              <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <Icon name="yard" size={14} className="text-white" />
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[20px] font-bold">{farmName}</h2>
              <p className="text-[16px] font-semibold">{user?.name}</p>
              {user?.phone ? (
                <p className="mt-1 flex items-center gap-1 text-[12px] text-on-surface-variant">
                  <Icon name="call" size={16} className="text-primary" />
                  {formatDisplayPhone(user.phone)}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-low px-4 py-3">
            <p className="flex items-center gap-2 text-[14px] font-medium">
              <Icon name="pin_drop" size={18} className="text-primary" />
              {place || 'Farm linked'}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold text-white">
              <Icon name="verified" size={14} filled />
              Verified Grower
            </span>
          </div>
          {user?.farmProfile?.plot ? (
            <p className="mt-3 flex items-center gap-1 text-[12px] text-on-surface-variant">
              <Icon name="wb_twilight" size={18} className="text-tertiary" />
              Plot {user.farmProfile.plot}
            </p>
          ) : null}
        </section>

        <p className="mt-8 mb-2 text-[13px] font-bold tracking-wider text-on-surface-variant uppercase">
          Harvest & Dispatch Times
        </p>
        <section className="rounded-[20px] bg-surface-lowest p-4 shadow-card">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-low text-primary">
                <Icon name="local_shipping" size={22} />
              </div>
              <div>
                <p className="text-[12px] text-on-surface-variant">Morning dispatch slot</p>
                <p className="text-[17px] font-semibold">6:00 AM – 8:30 AM</p>
              </div>
            </div>
            <Icon name="lock_clock" size={20} className="text-outline" />
          </div>
          <div className="my-2 h-px bg-surface-container" />
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-low text-secondary-container">
                <Icon name="timer" size={22} />
              </div>
              <div>
                <p className="text-[12px] text-on-surface-variant">Daily cutoff</p>
                <p className="text-[17px] font-semibold">8:00 PM</p>
              </div>
            </div>
            <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 text-[11px] font-extrabold text-on-tertiary-fixed">
              Fixed
            </span>
          </div>
        </section>

        <div className="mt-5 flex items-center gap-4 rounded-[20px] bg-surface-low p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
            <Icon name="eco" size={22} />
          </div>
          <div>
            <p className="text-[13px] font-bold">Zero Cold-Storage Guarantee</p>
            <p className="text-[12px] text-on-surface-variant">
              Orders picked today go live directly to customers for dawn arrival.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full px-8 py-3 text-[15px] font-bold text-on-surface-variant hover:text-error"
            onClick={() => setConfirm(true)}
          >
            <Icon name="logout" size={20} />
            Log out
          </button>
          <p className="mt-2 text-[12px] text-outline">Organic2Home Farm Admin</p>
        </div>
      </div>

      <LogoutConfirm
        variant="farmer"
        open={confirm}
        busy={busy}
        onClose={() => setConfirm(false)}
        onConfirm={confirmLogout}
      />
    </FarmerShell>
  );
}

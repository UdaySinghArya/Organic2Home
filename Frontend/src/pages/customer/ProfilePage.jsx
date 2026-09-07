import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import AccountLinks from '../../components/account/AccountLinks.jsx';
import AddressCard from '../../components/account/AddressCard.jsx';
import HelpFaqs from '../../components/account/HelpFaqs.jsx';
import LogoutConfirm from '../../components/account/LogoutConfirm.jsx';
import ProfileHero from '../../components/account/ProfileHero.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getToken } from '../../lib/api.js';
import { addressHeadline } from '../../lib/address.js';
import { BRAND_NAME } from '../../lib/brand.js';
import { inr, itemSummary } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { customerService } from '../../services/customerService.js';

export default function ProfilePage() {
  const { user, setSession, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      customerService.getProfile(),
      customerService.listAddresses().catch(() => ({ addresses: [] })),
      customerService.listOrders().catch(() => ({ orders: [] })),
    ])
      .then(([me, addr, ords]) => {
        setProfile(me.profile);
        setName(me.profile.name || '');
        setEmail(me.profile.email || '');
        setAddresses(addr.addresses || []);
        setOrders(ords.orders || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await customerService.updateProfile({ name, email });
      setProfile(data.profile);
      setSession(data.profile, getToken());
      setEditing(false);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmLogout() {
    setBusy(true);
    await logout();
    navigate(paths.welcome, { replace: true });
  }

  const latest = orders[0];
  const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
  const extras = {
    [paths.orders]: orders.length ? `${orders.length} harvest${orders.length === 1 ? '' : 's'}` : 'No harvests booked yet',
    [paths.addresses]: addresses.length
      ? `${addresses.length} saved destination${addresses.length === 1 ? '' : 's'}`
      : 'Add a dawn drop-off',
  };

  return (
    <CustomerShell title="Direct Harvest" subtitle="Direct Harvest">
      <div className="mx-auto w-full max-w-[960px]">
        <div className="md:hidden">
          <ProfileHero profile={profile} />
          <div className="mb-5 flex items-center justify-between gap-3 rounded-[20px] bg-surface-lowest p-4 shadow-card">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
                <Icon name="wb_sunny" size={20} filled />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold">Direct from the field</p>
                <p className="truncate text-[12px] text-on-surface-variant">Picked at dawn · at your door 7–10 AM</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-extrabold text-primary">
              Zero Stale
            </span>
          </div>
          <AccountLinks extras={extras} />
          <button
            type="button"
            className="mt-3 text-[13px] font-bold text-primary"
            onClick={() => setEditing((open) => !open)}
          >
            {editing ? 'Close editor' : 'Edit name & email'}
          </button>
          {editing ? (
            <form className="mt-3" onSubmit={save}>
              <Card className="flex flex-col gap-4">
                <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {error ? <p className="text-[12px] font-medium text-secondary">{error}</p> : null}
                <Button type="submit" variant="secondary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save profile'}
                </Button>
              </Card>
            </form>
          ) : null}
          <p className="mt-8 flex items-center justify-center gap-1 text-center text-[12px] text-on-surface-variant opacity-70">
            <Icon name="psychiatry" size={16} className="text-primary" />
            Committed to zero chemical storage & farm dignity
          </p>
          <div className="mt-8 flex flex-col items-center pb-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold text-on-surface-variant hover:bg-error-container/30 hover:text-error"
              onClick={() => setConfirm(true)}
            >
              <Icon name="logout" size={18} />
              Log out
            </button>
            <span className="mt-2 text-[11px] font-extrabold tracking-wider text-on-surface-variant/60 uppercase">
              {BRAND_NAME} Direct Harvest
            </span>
          </div>
        </div>

        <div className="hidden space-y-8 md:block">
          <ProfileHero profile={profile} variant="desktop" onLogout={() => setConfirm(true)} />
          {error && !editing ? <p className="text-[12px] font-medium text-secondary">{error}</p> : null}
          <AccountLinks variant="desktop" extras={extras} />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-7">
              <Card className="p-8" padded={false}>
                <div className="mb-5 flex items-center justify-between px-8 pt-8">
                  <div>
                    <p className="ks-label text-primary">Locations</p>
                    <h2 className="ks-title mt-1">Saved Addresses</h2>
                  </div>
                  <Button variant="secondary" className="min-h-10 px-4 text-[13px]" onClick={() => navigate(paths.addressNew)}>
                    <Icon name="add" size={16} />
                    Add address
                  </Button>
                </div>
                <div className="space-y-4 px-8 pb-8">
                  {defaultAddress ? (
                    <AddressCard
                      address={defaultAddress}
                      onEdit={(item) => navigate(paths.addressEdit(item.id))}
                    />
                  ) : (
                    <p className="text-[14px] text-on-surface-variant">No addresses saved yet. Add a dawn drop-off.</p>
                  )}
                </div>
              </Card>
              <Card className="p-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-primary">
                    <Icon name="psychology_alt" size={18} />
                  </span>
                  <div>
                    <p className="ks-label text-primary">Transparency</p>
                    <h2 className="ks-title">Direct Harvest FAQ</h2>
                  </div>
                </div>
                <HelpFaqs variant="list" />
              </Card>
            </div>
            <div className="lg:col-span-5">
              {latest ? (
                <Card className="p-8">
                  <p className="ks-label text-secondary">Latest harvest</p>
                  <h3 className="ks-title mt-1">Order #{latest.orderNumber}</h3>
                  <div className="mt-5 flex items-center justify-between rounded-[20px] bg-surface-low p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-primary">
                        <Icon name="agriculture" size={20} />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold">{latest.orderStatus.replaceAll('_', ' ')}</p>
                        <p className="text-[12px] text-on-surface-variant">{latest.deliverySlot}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-1 text-[12px] text-on-surface-variant">
                    <div className="flex justify-between py-1">
                      <span>Items</span>
                      <span className="max-w-[200px] truncate text-right font-bold text-on-surface">{itemSummary(latest.items)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Destination</span>
                      <span className="font-bold text-on-surface">{addressHeadline(latest.address) || 'Saved address'}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-outline-soft pt-4">
                    <div>
                      <p className="ks-label text-outline">Total</p>
                      <p className="ks-price text-primary">{inr(latest.total)}</p>
                    </div>
                    <Button variant="secondary" className="min-h-10 px-4 text-[13px]" onClick={() => navigate(paths.order(latest.id))}>
                      View order
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-8">
                  <p className="ks-label text-secondary">Tomorrow morning</p>
                  <h3 className="ks-title mt-1">No harvest booked yet</h3>
                  <p className="mt-2 text-[14px] text-on-surface-variant">Order today for a 7–10 AM doorstep drop.</p>
                  <Button className="mt-5 w-full" onClick={() => navigate(paths.home)}>
                    Shop produce
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <LogoutConfirm open={confirm} busy={busy} onClose={() => setConfirm(false)} onConfirm={confirmLogout} />
    </CustomerShell>
  );
}

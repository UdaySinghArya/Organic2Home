import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import AddressCard from '../../components/account/AddressCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Dialog from '../../components/ui/Dialog.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { paths } from '../../lib/paths.js';
import { customerService } from '../../services/customerService.js';

export default function AddressesPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromCheckout = params.get('from') === 'checkout';
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await customerService.listAddresses();
      setAddresses(data.addresses || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const addPath = `${paths.addressNew}${fromCheckout ? '?from=checkout' : ''}`;

  async function deliverHere(address) {
    try {
      if (!address.isDefault) await customerService.updateAddress(address.id, { isDefault: true });
      if (fromCheckout) navigate(paths.checkout);
      else await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmDelete() {
    if (!removing) return;
    try {
      await customerService.deleteAddress(removing.id);
      setRemoving(null);
      await load();
    } catch (err) {
      setError(err.message);
      setRemoving(null);
    }
  }

  return (
    <CustomerShell
      title="Delivery Addresses"
      showNav={!fromCheckout}
      onBack={() => navigate(fromCheckout ? paths.checkout : paths.profile)}
    >
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-surface-container px-3 py-1.5 text-[13px] font-bold text-primary">
            Saved ({addresses.length})
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-tertiary">
            <Icon name="wb_sunny" size={14} filled />
            <span className="ks-label">Dawn Dispatch</span>
          </span>
        </div>

        {loading ? <LoadingState /> : null}
        {error && !addresses.length ? <ErrorState message={error} onRetry={load} /> : null}

        {!loading && addresses.length === 0 ? (
          <div className="relative overflow-hidden rounded-[24px] bg-surface-lowest px-8 py-12 text-center shadow-card">
            <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-surface-low" />
            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container shadow-sm">
              <Icon name="cottage" size={44} filled className="text-primary" />
              <span className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container text-white shadow-sm">
                <Icon name="eco" size={15} filled />
              </span>
            </div>
            <h2 className="relative ks-title">No addresses saved yet</h2>
            <p className="relative mx-auto mt-2 max-w-[270px] text-[14px] text-on-surface-variant">
              Add a delivery address for tomorrow morning's fresh farm crate.
            </p>
            <Button className="relative mt-8 w-full" onClick={() => navigate(addPath)}>
              <Icon name="add_location_alt" size={18} />
              Add address
            </Button>
            <p className="relative mt-5 flex items-center justify-center gap-1.5 text-[11px] font-extrabold tracking-wider text-tertiary uppercase">
              <Icon name="schedule" size={15} />
              Orders cutoff at 8:00 PM for next-dawn delivery
            </p>
          </div>
        ) : null}

        {error && addresses.length ? <p className="mb-3 text-[12px] font-medium text-secondary">{error}</p> : null}

        <div className="flex flex-col gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onDeliverHere={deliverHere}
              onEdit={(item) => navigate(`${paths.addressEdit(item.id)}${fromCheckout ? '?from=checkout' : ''}`)}
              onDelete={setRemoving}
            />
          ))}
        </div>

        {addresses.length ? (
          <>
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] bg-surface-low p-4 text-[15px] font-bold text-primary shadow-sm"
              onClick={() => navigate(addPath)}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
                <Icon name="add" size={20} />
              </span>
              + Add new address
            </button>
            <div className="mt-4 flex items-start gap-3 rounded-[20px] bg-surface-lowest p-4 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
                <Icon name="local_shipping" size={18} />
              </span>
              <div>
                <p className="text-[13px] font-bold">Zero Warehouse Latency</p>
                <p className="text-[12px] text-on-surface-variant">
                  Produce is plucked at dusk from nearby fields and delivered straight to this doorstep before 10 AM.
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <Dialog
        open={Boolean(removing)}
        title="Remove this address?"
        confirmLabel="Delete"
        onClose={() => setRemoving(null)}
        onConfirm={confirmDelete}
      >
        Tomorrow’s crate will need another drop-off if this was the default.
      </Dialog>
    </CustomerShell>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FarmerShell from '../../components/layout/FarmerShell.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatusPill from '../../components/ui/StatusPill.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { formatAddress, inr } from '../../lib/format.js';
import { customerOf, initials, nextOrderAction } from '../../lib/farmerUi.js';
import { paymentCopy } from '../../lib/orderUi.js';
import { produceImage } from '../../lib/produceImages.js';
import { formatDisplayPhone } from '../../lib/phone.js';
import { paths } from '../../lib/paths.js';
import { farmerService } from '../../services/farmerService.js';

export default function FarmerOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await farmerService.getOrder(id);
      setOrder(data.order);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function advance(status) {
    setBusy(true);
    try {
      const data = await farmerService.patchOrderStatus(id, { status });
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const customer = customerOf(order);
  const action = order ? nextOrderAction(order.orderStatus) : null;
  const crateCount = order?.items?.length || 0;

  return (
    <FarmerShell onBack={() => navigate(paths.farmerOrders)} headerTitle="Order Details" showNav={false}>
      {!order && !error ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {order ? (
        <div className="mx-auto max-w-xl pb-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold tracking-wider text-on-surface-variant uppercase">
                Order Management
              </p>
              <h1 className="ks-title">Order {order.orderNumber}</h1>
            </div>
            <StatusPill status={order.orderStatus} />
          </div>

          <div className="mb-4 flex items-start gap-3 rounded-[20px] bg-surface-low p-4 shadow-sm">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
              <Icon name="psychiatry" size={18} />
            </div>
            <div>
              <p className="text-[13px] font-bold">Morning Batch • Picked at dusk</p>
              <p className="mt-0.5 text-[12px] text-on-surface-variant">
                Grade carefully and keep stems intact for the dawn doorstep drop.
              </p>
            </div>
          </div>

          <section className="mb-4 rounded-[20px] bg-surface-lowest p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="inventory_2" size={20} className="text-primary" />
                <h2 className="text-[17px] font-semibold">Items to Harvest & Pack</h2>
              </div>
              <span className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-extrabold text-on-surface-variant">
                {crateCount} crate{crateCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div
                  key={`${item.productId}-${item.name}`}
                  className="flex items-center gap-4 rounded-[16px] bg-surface-low p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-surface-container">
                    {produceImage(item) ? (
                      <img alt={item.name} src={produceImage(item)} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary">
                        <Icon name="eco" size={22} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-[17px] font-semibold">{item.name}</h3>
                      <span className="ks-price shrink-0">{inr(item.subtotal)}</span>
                    </div>
                    <p className="mt-1 text-[12px] font-semibold text-primary">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[16px] bg-surface-container/40 p-4">
              <div>
                <p className="text-[12px] text-on-surface-variant">Total farm payout</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-extrabold text-primary uppercase">
                  <Icon name="verified" size={16} />
                  {paymentCopy(order)}
                </p>
              </div>
              <p className="ks-display tracking-tight">{inr(order.total)}</p>
            </div>
          </section>

          <section className="mb-5 rounded-[20px] bg-surface-lowest p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="local_shipping" size={20} className="text-primary" />
                <h2 className="text-[17px] font-semibold">Customer & Delivery</h2>
              </div>
              <span className="rounded-full bg-tertiary-fixed px-2.5 py-1 text-[11px] font-extrabold text-on-tertiary-fixed">
                Dawn Slot
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-[17px] font-bold text-primary">
                  {initials(customer.name)}
                </div>
                <div>
                  <p className="text-[15px] font-bold">{customer.name}</p>
                  {customer.phone ? (
                    <p className="text-[12px] text-on-surface-variant">{formatDisplayPhone(customer.phone)}</p>
                  ) : null}
                </div>
              </div>
              {customer.phone ? (
                <a
                  aria-label="Call customer"
                  href={`tel:+91${String(customer.phone).replace(/\D/g, '')}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-primary"
                >
                  <Icon name="call" size={20} />
                </a>
              ) : null}
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-surface-low p-4">
              <Icon name="home_pin" size={20} className="mt-0.5 shrink-0 text-secondary-container" />
              <div>
                <p className="text-[11px] font-extrabold tracking-wider text-on-surface-variant uppercase">
                  Drop-off Address
                </p>
                <p className="mt-1 text-[14px] font-medium">{formatAddress(order.address) || 'Address on file'}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-[16px] bg-surface-container p-4">
              <div className="flex items-center gap-3">
                <Icon name="wb_twilight" size={20} className="text-primary" />
                <div>
                  <p className="text-[11px] font-extrabold text-on-surface-variant">Requested harvest arrival</p>
                  <p className="text-[13px] font-bold">{order.deliverySlot}</p>
                </div>
              </div>
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-extrabold text-white">Kal Aayega</span>
            </div>
          </section>

          <div className="mb-6 flex items-center justify-between rounded-[20px] bg-surface-low p-4">
            <div className="flex items-center gap-3">
              <Icon name="eco" size={22} className="text-primary" />
              <div>
                <p className="text-[13px] font-bold">Eco-crate cotton lined</p>
                <p className="text-[12px] text-on-surface-variant">No plastic wraps • Zero cold storage transit</p>
              </div>
            </div>
            <Icon name="check" size={22} className="text-primary" />
          </div>

          {action ? (
            <Button className="w-full" disabled={busy} onClick={() => advance(action.status)}>
              <Icon name={action.icon} size={22} />
              {busy ? 'Updating…' : action.label}
            </Button>
          ) : null}
          {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' ? (
            <button
              type="button"
              disabled={busy}
              className="mt-3 flex h-12 w-full items-center justify-center rounded-full text-[13px] font-bold text-error"
              onClick={() => advance('CANCELLED')}
            >
              Cancel order
            </button>
          ) : null}
        </div>
      ) : null}
    </FarmerShell>
  );
}

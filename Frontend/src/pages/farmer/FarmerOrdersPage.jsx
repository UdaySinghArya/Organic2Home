import { useEffect, useState } from 'react';
import FarmerShell from '../../components/layout/FarmerShell.jsx';
import FarmerOrderCard from '../../components/farmer/FarmerOrderCard.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { formatWeekdayDate, inr } from '../../lib/format.js';
import { dispatchCounts } from '../../lib/farmerUi.js';
import { farmerService } from '../../services/farmerService.js';

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await farmerService.listOrders();
      setOrders(data.orders || []);
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

  async function advance(order, status) {
    setBusyId(order.id);
    try {
      await farmerService.patchOrderStatus(order.id, { status });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  }

  const counts = dispatchCounts(orders);
  const payout = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  return (
    <FarmerShell>
      <div className="mx-auto max-w-[720px] md:max-w-[960px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
            <h1 className="ks-headline tracking-tight">Today's Dispatch</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed px-4 py-1.5 text-[13px] font-bold text-on-tertiary-fixed shadow-sm">
            <Icon name="calendar_today" size={16} />
            {formatWeekdayDate()}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between px-1">
          <p className="text-[12px] text-on-surface-variant">
            {orders.length} farm order{orders.length === 1 ? '' : 's'} scheduled
            {orders.length ? (
              <>
                <span className="text-outline"> • </span>
                <span className="font-semibold text-primary">{inr(payout)} total payout</span>
              </>
            ) : null}
          </p>
          <span className="flex items-center gap-1 text-[11px] font-extrabold tracking-wider text-secondary uppercase">
            <Icon name="bolt" size={14} />
            Dawn Slot
          </span>
        </div>

      <div className="mb-6 mt-5 grid grid-cols-3 gap-2">
        {[
          { icon: 'agriculture', value: counts.field, label: 'In Field', tone: 'bg-surface-container text-primary' },
          { icon: 'local_shipping', value: counts.transit, label: 'Transit', tone: 'bg-secondary-fixed text-secondary' },
          { icon: 'check_circle', value: counts.done, label: 'Done', tone: 'bg-primary-fixed text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center rounded-[20px] bg-surface-lowest p-3 text-center shadow-card">
            <div className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full ${stat.tone}`}>
              <Icon name={stat.icon} size={16} />
            </div>
            <span className="text-[16px] font-extrabold leading-none">{stat.value}</span>
            <span className="mt-1 text-[10px] font-extrabold text-on-surface-variant">{stat.label}</span>
          </div>
        ))}
      </div>

      {loading ? <LoadingState label="Loading orders…" /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && orders.length === 0 ? (
        <EmptyState icon="receipt_long" title="No farm orders yet" body="Customer orders for your produce will appear here." />
      ) : null}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <FarmerOrderCard
            key={order.id}
            order={order}
            busy={busyId === order.id}
            onAdvance={advance}
          />
        ))}
      </div>
      </div>
    </FarmerShell>
  );
}

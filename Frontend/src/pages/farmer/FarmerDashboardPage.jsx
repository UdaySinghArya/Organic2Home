import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FarmerShell from '../../components/layout/FarmerShell.jsx';
import HarvestCard from '../../components/farmer/HarvestCard.jsx';
import FarmerOrderCard from '../../components/farmer/FarmerOrderCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { formatWeekdayDate } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { farmerService } from '../../services/farmerService.js';

export default function FarmerDashboardPage() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [busyOrderId, setBusyOrderId] = useState('');
  const [busyAll, setBusyAll] = useState(false);

  async function load() {
    try {
      const [harvest, orderData] = await Promise.all([
        farmerService.getTomorrowHarvest(),
        farmerService.listOrders(),
      ]);
      setData(harvest);
      setOrders(orderData.orders || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function pick(id) {
    setBusyId(id);
    try {
      await farmerService.pickHarvest(id, {});
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  }

  async function pack(id) {
    setBusyId(id);
    try {
      await farmerService.packHarvest(id, {});
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  }

  async function advanceOrder(order, status) {
    setBusyOrderId(order.id);
    try {
      await farmerService.patchOrderStatus(order.id, { status });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyOrderId('');
    }
  }

  async function confirmAll() {
    const remaining = (data?.items || []).filter((item) => item.status !== 'PACKED');
    if (remaining.length === 0) return;
    setBusyAll(true);
    try {
      for (const item of remaining) {
        if (item.status === 'PENDING') await farmerService.pickHarvest(item.id, {});
        await farmerService.packHarvest(item.id, {});
      }
      await load();
    } catch (err) {
      setError(err.message);
      await load();
    } finally {
      setBusyAll(false);
    }
  }

  const items = data?.items || [];
  const packedCount = items.filter((item) => item.status === 'PACKED').length;
  const pendingCount = items.filter((item) => item.status !== 'PACKED').length;
  const progress = items.length ? Math.round((packedCount / items.length) * 100) : 0;
  const preview = orders.slice(0, 3);
  const orderCount = orders.length;
  return (
    <FarmerShell>
      {!data && !error ? <LoadingState label="Loading harvest…" /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {data ? (
        <>
          <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-end">
            <div>
              <span className="mb-2 inline-flex items-center gap-1.5 self-start rounded-full bg-tertiary-fixed px-4 py-1.5 text-[11px] font-extrabold tracking-wider text-on-tertiary-fixed uppercase">
                <Icon name="schedule" size={16} className="text-tertiary" />
                {formatWeekdayDate(data.date)} • Cutoff 8:00 PM
              </span>
              <div className="mt-2 flex items-baseline justify-between gap-3 md:block">
                <h1 className="ks-headline md:ks-display tracking-tight">Pick for tomorrow</h1>
                <span className="inline-flex shrink-0 rounded-full bg-surface-container px-2 py-1 text-[13px] font-bold text-primary md:hidden">
                  {items.length} item{items.length === 1 ? '' : 's'} to harvest
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-[14px] text-on-surface-variant md:text-[16px] md:font-medium">
                <Icon name="eco" size={16} className="text-secondary md:hidden" />
                {items.length
                  ? `${items.length} item${items.length === 1 ? '' : 's'} grouped from ${orderCount} farm order${orderCount === 1 ? '' : 's'}`
                  : 'Fresh evening pluck for dawn doorstep dispatches'}
              </p>
            </div>
            {items.length > 0 ? (
              <div className="hidden items-center rounded-full bg-surface-lowest p-1 shadow-sm md:flex">
                <span className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold text-primary">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
                  Live inventory ready
                </span>
              </div>
            ) : null}
          </div>

          {items.length > 0 ? (
            <div className="mb-5 rounded-[20px] bg-surface-lowest p-4 shadow-card md:hidden">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[13px] font-bold">
                  <Icon name="inventory_2" size={18} className="text-primary" />
                  Batch crates packed
                </span>
                <span className="text-[13px] font-bold text-primary">
                  {packedCount} of {items.length} items ready
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-container">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : null}

          <section className="mb-10">
            <div className="mb-4 hidden items-center justify-between md:flex">
              <div className="flex items-center gap-2">
                <h2 className="ks-title">Harvest Checklist</h2>
                <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-extrabold text-on-surface-variant">
                  {pendingCount} pending
                </span>
              </div>
              <span className="text-[12px] text-on-surface-variant">Tap to mark produce crated</span>
            </div>

            {items.length === 0 ? (
              <EmptyState
                icon="agriculture"
                title="No harvest locked yet"
                body="When customers place paid or COD orders, required quantities appear here."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                {items.map((item, index) => (
                  <HarvestCard
                    key={item.id}
                    item={item}
                    index={index + 1}
                    busy={busyId === item.id || busyAll}
                    onPick={pick}
                    onPack={pack}
                  />
                ))}
              </div>
            )}

            {items.length > 0 ? (
              <div className="sticky bottom-24 z-20 mt-5 md:static md:flex md:flex-row md:items-center md:justify-between md:gap-4 md:rounded-[20px] md:bg-surface-lowest md:p-5 md:shadow-card">
                <div className="mb-3 hidden items-center gap-4 md:flex">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-low text-primary">
                    <Icon name="inventory_2" size={24} />
                  </div>
                  <div>
                    <p className="text-[17px] font-semibold">Batch dispatch summary</p>
                    <p className="text-[12px] text-on-surface-variant">
                      Required quantities from live customer orders
                    </p>
                  </div>
                </div>
                <Button
                  variant="harvest"
                  className="w-full shadow-md md:w-auto"
                  disabled={busyAll || pendingCount === 0}
                  onClick={confirmAll}
                >
                  <Icon name="done_all" size={20} />
                  {busyAll
                    ? 'Packing…'
                    : pendingCount === 0
                      ? 'All harvest packed'
                      : `Confirm harvest packed (${packedCount}/${items.length})`}
                </Button>
              </div>
            ) : (
              <div className="mt-6 rounded-[20px] bg-surface-low p-4">
                <p className="text-[13px] font-bold">Upcoming order buffer</p>
                <p className="mt-1 text-[12px] text-on-surface-variant">
                  Cutoff locked at 8:00 PM tonight. Late customer additions appear here automatically.
                </p>
              </div>
            )}
          </section>

          <section className="hidden flex-col gap-4 md:flex">
            <div className="flex items-center justify-between">
              <h2 className="ks-title">Recent Orders Preview</h2>
              <Link to={paths.farmerOrders} className="text-[13px] font-bold text-primary hover:underline">
                {orderCount ? `View all ${orderCount} orders →` : 'Open orders →'}
              </Link>
            </div>
            {preview.length === 0 ? (
              <p className="text-[14px] text-on-surface-variant">No farm orders yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {preview.map((order) => (
                  <FarmerOrderCard
                    key={order.id}
                    order={order}
                    busy={busyOrderId === order.id}
                    onAdvance={advanceOrder}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </FarmerShell>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import OrderDetailBody from '../../components/orders/OrderDetailBody.jsx';
import OrderListCard from '../../components/orders/OrderListCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { EMPTY_BASKET_SRC } from '../../lib/brand.js';
import { paths } from '../../lib/paths.js';
import { customerService } from '../../services/customerService.js';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await customerService.listOrders();
      const next = data.orders || [];
      setOrders(next);
      setSelectedId((current) => current || next[0]?.id || '');
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

  function openOrder(order) {
    setSelectedId(order.id);
    if (window.matchMedia('(max-width: 767px)').matches) {
      navigate(paths.order(order.id));
    }
  }

  const selected = orders.find((order) => order.id === selectedId) || orders[0];

  return (
    <CustomerShell title="Orders">
      <div className="mx-auto w-full max-w-[960px]">
        {loading ? <LoadingState label="Loading orders…" /> : null}
        {error ? <ErrorState message={error} onRetry={load} /> : null}

        {!loading && !error && orders.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center px-2 py-8 text-center">
            <img src={EMPTY_BASKET_SRC} alt="Empty harvest basket" className="h-64 w-64 object-contain sm:h-72 sm:w-72" />
            <h1 className="mt-2 text-[24px] font-bold tracking-tight sm:text-[28px]">No orders yet</h1>
            <p className="mt-2 max-w-[260px] text-[15px] leading-relaxed text-on-surface/70">
              Order today for tomorrow's dawn delivery.
            </p>
            <Button className="mt-8 px-8" onClick={() => navigate(paths.home)}>
              Shop today's produce
            </Button>
          </div>
        ) : null}

        {!loading && !error && orders.length > 0 ? (
          <>
            <div className="mb-5 flex items-baseline justify-between md:mb-10">
              <div>
                <h1 className="ks-headline md:text-[36px] md:leading-[44px]">Your orders</h1>
                <p className="mt-1 hidden text-[15px] text-on-surface-variant md:block">Track direct farm harvest batches.</p>
              </div>
              <span className="rounded-full bg-[#E6F4EA] px-2.5 py-1 text-[11px] font-bold tracking-wider text-primary uppercase">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12 md:gap-8">
              <div className="flex flex-col gap-4 md:col-span-5">
                {orders.map((order) => (
                  <OrderListCard
                    key={order.id}
                    order={order}
                    selected={selected?.id === order.id}
                    onClick={() => openOrder(order)}
                  />
                ))}
                <Button className="mt-4 w-full md:hidden" onClick={() => navigate(paths.home)}>
                  <Icon name="add" size={18} />
                  Start New Order
                </Button>
              </div>

              <div className="hidden rounded-[20px] border border-black/5 bg-surface-lowest p-8 shadow-sm md:col-span-7 md:flex md:flex-col">
                {selected ? (
                  <OrderDetailBody
                    order={selected}
                    variant="desktop"
                    onRetryPayment={() => navigate(`${paths.payment}?orderId=${selected.id}`)}
                  />
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </CustomerShell>
  );
}

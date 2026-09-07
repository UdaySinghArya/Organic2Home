import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { LoadingState } from '../../components/ui/States.jsx';
import { SUCCESS_LEAF_SRC } from '../../lib/brand.js';
import { inr } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { customerService } from '../../services/customerService.js';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      navigate(paths.orders, { replace: true });
      return;
    }
    customerService
      .getOrder(orderId)
      .then((data) => {
        const next = data.order;
        if (next.paymentMethod !== 'COD' && next.paymentStatus !== 'SUCCESS') {
          navigate(`${paths.paymentFailed}?orderId=${orderId}`, { replace: true });
          return;
        }
        setOrder(next);
      })
      .catch((err) => setError(err.message));
  }, [orderId, navigate]);

  const paidOnline = order && order.paymentMethod !== 'COD' && order.paymentStatus === 'SUCCESS';

  return (
    <CustomerShell title="Cart">
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center px-1 pb-8 text-center md:max-w-[720px] md:pt-4">
        <div className="mb-4 flex w-full items-center justify-between md:hidden">
          <button
            type="button"
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-lowest shadow-sm"
            onClick={() => navigate(paths.orders)}
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <span className="text-[17px] font-semibold">Order confirmation</span>
          <div className="h-10 w-10" />
        </div>

        {error ? <p className="text-[12px] font-medium text-secondary">{error}</p> : null}
        {!order && !error ? <LoadingState label="Loading order…" /> : null}

        {order ? (
          <>
            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-primary-fixed/40 blur-xl" />
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-surface-lowest p-3 shadow-card md:h-40 md:w-40">
                <img alt="Harvest confirmation sprout" className="h-28 w-28 object-contain md:h-32 md:w-32" src={SUCCESS_LEAF_SRC} />
              </div>
              <span className="absolute right-0 -bottom-1 hidden items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-0.5 text-[11px] font-extrabold md:inline-flex">
                <Icon name="wb_sunny" size={14} filled />
                Kal Aayega
              </span>
            </div>

            <h1 className="ks-headline mt-3 tracking-tight md:text-[40px] md:leading-[48px]">Booked for tomorrow</h1>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-low px-4 py-1 text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-[13px] font-bold tracking-wider">Order #{order.orderNumber}</span>
              <span className="hidden text-[12px] text-on-surface-variant md:inline">• Pre-harvest locked</span>
            </div>

            <Card className="mt-6 w-full text-left">
              <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-surface-low px-3.5 py-2.5">
                <Icon name="spa" size={20} filled className="text-primary" />
                <p className="text-[12px] font-medium leading-snug">We pick this from the field tomorrow morning</p>
              </div>

              <div className="hidden items-center justify-between md:flex">
                <div className="flex items-center gap-2">
                  <Icon name="receipt_long" size={20} className="text-primary" />
                  <h2 className="font-bold">Order summary</h2>
                </div>
                <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
                  {paidOnline ? 'Paid Online' : 'Cash on delivery'}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {order.items.map((item) => (
                  <div key={`${item.productId}-${item.name}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-[12px] text-on-surface-variant">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <span className="ks-price">{inr(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="my-4 h-px bg-surface-container" />

              {order.deliveryFee != null ? (
                <div className="mb-3 hidden rounded-2xl bg-surface-low p-3 text-[12px] text-on-surface-variant md:block">
                  <div className="flex justify-between">
                    <span>Items</span>
                    <span>{inr(order.subtotal)}</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span>Sunrise doorstep drop</span>
                    <span className="font-semibold text-primary">
                      {order.deliveryFee === 0 ? 'FREE' : inr(order.deliveryFee)}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex items-end justify-between">
                <span className="font-bold">{paidOnline ? 'Total paid' : 'Total'}</span>
                <div className="text-right">
                  <p className="ks-price text-primary md:text-[30px]">{inr(order.total)}</p>
                  <p className="ks-caption text-on-surface-variant">
                    {paidOnline ? `paid via ${order.paymentMethod}` : 'pay on delivery'}
                  </p>
                </div>
              </div>
              {order.deliverySlot ? (
                <p className="ks-caption mt-3 flex items-center gap-1 text-outline">
                  <Icon name="schedule" size={14} />
                  Slot: {order.deliverySlot}
                </p>
              ) : null}
            </Card>

            <Button className="mt-8 w-full" onClick={() => navigate(paths.order(order.id))}>
              View order
            </Button>
            <button
              type="button"
              className="mt-4 text-[14px] font-semibold text-primary"
              onClick={() => navigate(paths.home)}
            >
              Back to shop
            </button>
          </>
        ) : null}
      </div>
    </CustomerShell>
  );
}

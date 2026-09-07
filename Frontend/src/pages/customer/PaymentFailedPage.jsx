import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { HARVEST_BASKET_SRC } from '../../lib/brand.js';
import { inr, itemSummary } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { produceImage } from '../../lib/produceImages.js';
import { customerService } from '../../services/customerService.js';

export default function PaymentFailedPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const reason = params.get('reason');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    customerService
      .getOrder(orderId)
      .then((data) => {
        if (data.order.paymentStatus === 'SUCCESS' || data.order.paymentMethod === 'COD') {
          navigate(`${paths.orderSuccess}?orderId=${orderId}`, { replace: true });
          return;
        }
        setOrder(data.order);
      })
      .catch((err) => setError(err.message));
  }, [orderId, navigate]);

  const city = order?.address?.city;
  const thumb = produceImage(order?.items?.[0]) || HARVEST_BASKET_SRC;

  const retry = () => navigate(orderId ? `${paths.payment}?orderId=${orderId}` : paths.orders);

  async function payWithCod() {
    if (!orderId) return;
    setSwitching(true);
    setError('');
    try {
      const data = await customerService.switchToCod({ orderId });
      if (data.order?.paymentMethod === 'COD' && data.order.paymentStatus !== 'SUCCESS') {
        navigate(`${paths.orderSuccess}?orderId=${orderId}`, { replace: true });
        return;
      }
      setError('Could not switch to cash on delivery');
    } catch (err) {
      setError(err.message);
    } finally {
      setSwitching(false);
    }
  }

  return (
    <CustomerShell title="Cart">
      <div className="mx-auto flex w-full max-w-[620px] flex-col items-center px-1 text-center md:pt-4">
        <div className="mb-4 hidden w-full items-center justify-between rounded-full bg-surface-low px-4 py-2 md:flex">
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-on-surface-variant">
            <Icon name="inventory_2" size={16} className="text-primary" />
            Harvest still reserved until dusk cutoff
          </span>
          <span className="rounded-full bg-tertiary-fixed px-2.5 py-0.5 text-[11px] font-extrabold">Hold active</span>
        </div>

        <div className="relative mb-5 flex items-center justify-center">
          <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-secondary-fixed/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-fixed shadow-sm">
              <Icon name="sync_problem" size={30} className="text-secondary" />
            </div>
          </div>
          <span className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-surface-lowest shadow-sm">
            <Icon name="eco" size={18} filled className="text-primary" />
          </span>
        </div>

        <h1 className="ks-title tracking-tight md:text-[28px]">Payment didn't go through</h1>
        <p className="mt-2 max-w-[420px] text-[14px] leading-relaxed text-on-surface-variant md:text-[16px]">
          {reason || 'Your order is saved, but the bank transaction was interrupted.'}
        </p>
        {error ? <p className="mt-2 text-[12px] font-medium text-secondary">{error}</p> : null}

        <div className="mt-5 flex w-full items-center gap-3 rounded-[16px] bg-surface-low p-3 text-left shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed">
            <Icon name="wb_twilight" size={20} filled />
          </span>
          <div>
            <p className="ks-label text-tertiary">Harvest Safe</p>
            <p className="text-[12px] leading-tight text-on-surface">
              Produce is reserved for tomorrow's morning harvest route.
            </p>
          </div>
        </div>

        {order ? (
          <Card className="mt-4 w-full text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="inventory_2" size={20} className="text-primary" />
                <p className="font-bold">Order #{order.orderNumber}</p>
              </div>
              <p className="ks-price">{inr(order.total)}</p>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-surface-low p-3">
              <img alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm" src={thumb} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold">{itemSummary(order.items)}</p>
                {city ? (
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-on-surface-variant">
                    <Icon name="location_on" size={14} className="text-primary" />
                    {city}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-on-surface-variant">
              <span className="flex items-center gap-1.5 text-[12px]">
                <Icon name="schedule" size={16} className="text-secondary" />
                Slot: {order.deliverySlot}
              </span>
              <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 text-[11px] font-extrabold">Kal Aayega</span>
            </div>
          </Card>
        ) : null}

        <div className="mt-8 flex w-full flex-col items-center gap-3">
          <Button className="w-full" onClick={retry}>
            <Icon name="refresh" size={18} />
            Try again
          </Button>
          <Button variant="secondary" className="w-full" disabled={switching || !orderId} onClick={payWithCod}>
            <Icon name="payments" size={18} />
            {switching ? 'Cash delivery selected' : 'Pay with cash on delivery'}
          </Button>
          <div className="mt-1 flex items-center gap-3 text-[13px] font-bold text-on-surface-variant">
            <button type="button" className="flex items-center gap-1" onClick={() => navigate(paths.cart)}>
              <Icon name="arrow_back" size={16} />
              Back to cart
            </button>
            <span className="hidden md:inline">·</span>
            <button type="button" className="hidden items-center gap-1 md:flex" onClick={() => navigate(paths.help)}>
              <Icon name="headset_mic" size={16} />
              Need help?
            </button>
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}

import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import StatusPill from '../ui/StatusPill.jsx';
import HarvestStepper from './HarvestStepper.jsx';
import { addressHeadline } from '../../lib/address.js';
import { formatDateTime, inr } from '../../lib/format.js';
import { fulfillmentOf, paymentCopy } from '../../lib/orderUi.js';
import { produceImage } from '../../lib/produceImages.js';

export default function OrderDetailBody({
  order,
  variant = 'page',
  onHelp,
  onShop,
  onRetryPayment,
}) {
  const desktop = variant === 'desktop';
  const status = fulfillmentOf(order);
  const upcoming = !['DELIVERED', 'CANCELLED'].includes(status);

  return (
    <div className={desktop ? 'flex flex-col gap-6' : 'flex flex-col gap-4'}>
      {desktop ? (
        <div className="flex items-center justify-between border-b border-outline-soft pb-6">
          <h2 className="text-[24px] font-bold tracking-tight">Order #{order.orderNumber}</h2>
          <StatusPill status={status} />
        </div>
      ) : upcoming ? (
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#E8F5E9] px-3.5 py-1.5 text-[12px] font-semibold tracking-wide text-primary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Picked from field tomorrow
        </div>
      ) : null}

      <Section desktop={desktop} title={desktop ? 'Status' : 'Harvest Status'}>
        <HarvestStepper order={order} variant={desktop ? 'flow' : 'timeline'} />
      </Section>

      <Section desktop={desktop} title={desktop ? 'Items' : 'Field Basket'} className={desktop ? 'border-t border-outline-soft pt-4' : ''}>
        <div className={desktop ? 'space-y-3' : 'divide-y divide-[#F6EFE5]'}>
          {order.items.map((item) => {
            const image = produceImage(item);
            return (
              <div key={`${item.productId}-${item.name}`} className="flex items-center justify-between py-3 first:pt-1">
                <div className="flex min-w-0 items-center gap-3">
                  {!desktop && image ? (
                    <img alt="" src={image} className="h-11 w-11 rounded-xl border border-[#F3ECE0] object-cover" />
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold">
                      {item.name}
                      {desktop ? ` (${item.quantity} ${item.unit})` : ''}
                    </p>
                    {!desktop ? (
                      <p className="text-[12px] text-on-surface-variant">
                        {item.quantity} {item.unit}
                      </p>
                    ) : null}
                  </div>
                </div>
                <span className="font-bold">{inr(item.subtotal)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-end justify-between border-t border-[#F3ECE0] pt-3.5">
          <div>
            <p className="font-bold">Total</p>
            <p className={`text-[12px] font-medium ${order.paymentStatus === 'FAILED' ? 'text-error' : 'text-primary'}`}>
              {paymentCopy(order)}
            </p>
          </div>
          <p className={`text-[18px] font-extrabold ${desktop ? 'text-primary' : ''}`}>{inr(order.total)}</p>
        </div>
      </Section>

      <div className={desktop ? 'rounded-[16px] bg-surface p-5' : ''}>
        {desktop ? (
          <DeliveryBlock order={order} />
        ) : (
          <Card>
            <DeliveryBlock order={order} />
          </Card>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={order.paymentStatus} />
        <StatusPill status={status} />
        <span className="ks-caption text-outline">Placed {formatDateTime(order.createdAt)}</span>
      </div>

      {order.paymentStatus === 'FAILED' && onRetryPayment ? (
        <Button className="w-full" onClick={onRetryPayment}>
          Try payment again
        </Button>
      ) : null}

      {desktop ? (
        <p className="pt-2 text-center text-[12px] text-on-surface-variant">
          Freshly pulled at dawn and delivered right to your doorstep.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {onHelp ? (
            <Button className="w-full" onClick={onHelp}>
              Need help?
            </Button>
          ) : null}
          {onShop ? (
            <button type="button" className="py-2.5 text-center text-[12px] font-medium text-on-surface-variant" onClick={onShop}>
              Return to fresh market catalog
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Section({ desktop, title, className = '', children }) {
  const body = (
    <>
      <p className="ks-label mb-3 text-outline">{title}</p>
      {children}
    </>
  );
  if (desktop) return <div className={className}>{body}</div>;
  return <Card>{body}</Card>;
}

function DeliveryBlock({ order }) {
  return (
    <>
      <p className="ks-label text-outline">Delivering to</p>
      <p className="mt-1.5 text-[14px] font-semibold">{addressHeadline(order.address) || 'Saved address'}</p>
      <p className="mt-0.5 text-[13px] font-medium text-primary">{order.deliverySlot}</p>
    </>
  );
}

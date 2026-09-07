import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import StatusPill from '../ui/StatusPill.jsx';
import { formatClock, inr, itemSummary } from '../../lib/format.js';
import { customerOf, initials, nextOrderAction } from '../../lib/farmerUi.js';
import { paths } from '../../lib/paths.js';

function packingHint(order) {
  if (order.orderStatus === 'DELIVERED') return 'Delivered';
  if (order.orderStatus === 'CANCELLED') return 'Cancelled';
  if (order.orderStatus === 'OUT_FOR_DELIVERY') return 'With delivery partner';
  if (order.orderStatus === 'PACKED') return 'Ready for dispatch';
  return order.deliverySlot ? `Pack for ${order.deliverySlot}` : 'Dawn slot';
}

export default function FarmerOrderCard({
  order,
  busy = false,
  compact = false,
  onAdvance,
}) {
  const navigate = useNavigate();
  const customer = customerOf(order);
  const action = nextOrderAction(order.orderStatus);
  const count = order.items?.length || 0;

  return (
    <article className="flex flex-col gap-4 rounded-[20px] bg-surface-lowest p-5 shadow-card">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-2 text-left"
        onClick={() => navigate(paths.farmerOrder(order.id))}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-low text-[17px] font-semibold text-primary">
            {initials(customer.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold">{customer.name}</p>
            <p className="text-[11px] font-extrabold tracking-wider text-outline uppercase">
              {order.orderNumber}
              {order.createdAt ? ` • ${formatClock(order.createdAt)}` : ''}
            </p>
          </div>
        </div>
        <StatusPill status={order.orderStatus} />
      </button>

      <div className="flex items-center justify-between gap-3 rounded-[16px] bg-surface-low/70 p-3">
        <p className="flex min-w-0 items-center gap-2 text-[12px] text-on-surface-variant">
          <Icon name="eco" size={20} className="shrink-0 text-primary" />
          <span className="truncate">
            <span className="font-semibold text-on-surface">
              {count} item{count === 1 ? '' : 's'}
            </span>
            {count ? ` • ${itemSummary(order.items)}` : ''}
          </span>
        </p>
        <span className="ks-price shrink-0">{inr(order.total)}</span>
      </div>

      {compact ? null : (
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <p className="flex items-center gap-1 text-[11px] font-extrabold text-on-surface-variant">
            <Icon name="wb_twilight" size={16} className="text-tertiary" />
            {packingHint(order)}
          </p>
          {action ? (
            <button
              type="button"
              disabled={busy}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-secondary-container px-5 text-[13px] font-bold text-white shadow-sm disabled:opacity-50"
              onClick={() => onAdvance?.(order, action.status)}
            >
              {busy ? 'Updating…' : action.label}
              <Icon name={action.icon} size={18} />
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}

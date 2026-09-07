import StatusPill from '../ui/StatusPill.jsx';
import { inr } from '../../lib/format.js';
import { orderTitle, orderWhenLabel, fulfillmentOf } from '../../lib/orderUi.js';
import { produceImage } from '../../lib/produceImages.js';

export default function OrderListCard({ order, selected = false, onClick }) {
  const items = order.items || [];
  const thumbs = items.map((item) => produceImage(item)).filter(Boolean).slice(0, 2);
  const status = fulfillmentOf(order);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[20px] border bg-surface-lowest p-5 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition active:scale-[0.99] md:p-6 ${
        selected ? 'border-[#F3ECE0] md:border-2 md:border-primary' : 'border-[#F3ECE0] md:border-black/5'
      }`}
    >
      <div className="hidden items-center justify-between gap-3 md:flex">
        <div className="min-w-0">
          <p className="text-[12px] font-bold tracking-wider text-on-surface-variant uppercase">{order.orderNumber}</p>
          <p className="mt-1 truncate text-[17px] font-bold">{orderTitle(items)}</p>
          <p className="mt-1 text-[16px] font-semibold">{inr(order.total)}</p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] font-bold tracking-tight">Order #{order.orderNumber}</span>
          <StatusPill status={status} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {thumbs.length ? (
              <div className="relative flex shrink-0 -space-x-2">
                {thumbs.map((src) => (
                  <img
                    key={src}
                    alt=""
                    src={src}
                    className="h-12 w-12 rounded-full object-cover shadow-sm ring-2 ring-white"
                  />
                ))}
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="truncate text-[16px] font-bold">{orderTitle(items)}</p>
              <p className="text-[12px] text-on-surface-variant">{orderWhenLabel(order)}</p>
            </div>
          </div>
          <span className="shrink-0 text-[18px] font-extrabold">{inr(order.total)}</span>
        </div>
      </div>
    </button>
  );
}

import Icon from '../ui/Icon.jsx';
import { produceImage } from '../../lib/produceImages.js';
import { harvestAction, harvestHint, qtyLabel } from '../../lib/farmerUi.js';

export default function HarvestCard({ item, index, busy, onPick, onPack }) {
  const product = item.product || {};
  const unit = product.unit || 'kg';
  const img = produceImage(product);
  const action = harvestAction(item.status);
  const packed = item.status === 'PACKED';

  function run() {
    if (action.kind === 'pick') onPick?.(item.id);
    if (action.kind === 'pack') onPack?.(item.id);
  }

  return (
    <article
      className={`flex flex-col gap-3 rounded-[20px] bg-surface-lowest p-4 shadow-card transition ${
        packed ? 'opacity-90' : ''
      }`}
    >
      <div className="flex gap-4 md:flex-col">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[16px] bg-surface-low md:aspect-square md:h-auto md:w-full">
          {img ? (
            <img alt={product.name || 'Produce'} src={img} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-primary">
              <Icon name="eco" size={28} />
            </div>
          )}
          <span className="absolute right-1 bottom-1 rounded-full bg-surface-lowest/90 px-1.5 py-0.5 text-[11px] font-extrabold md:hidden">
            #{String(index).padStart(2, '0')}
          </span>
          <span className="absolute top-3 left-3 hidden items-center gap-1 rounded-full bg-tertiary-fixed px-3 py-1 text-[11px] font-extrabold text-on-tertiary-fixed md:inline-flex">
            <Icon name="wb_sunny" size={14} />
            Kal Aayega
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="truncate text-[17px] font-semibold">{product.name || 'Produce'}</h2>
            <span className="ks-price shrink-0 text-primary md:hidden">{qtyLabel(item.requiredQuantity, unit)}</span>
          </div>
          <p className="mt-1 hidden items-baseline gap-1 md:flex">
            <span className="ks-display tracking-tight">{item.requiredQuantity}</span>
            <span className="text-[17px] font-semibold text-on-surface-variant">{unit}</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-on-surface-variant">
            <Icon name="receipt_long" size={14} />
            From {item.relatedOrderCount} customer order{item.relatedOrderCount === 1 ? '' : 's'}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-primary">
              {item.pickedQuantity}/{item.requiredQuantity} picked
            </span>
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-primary">
              {item.packedQuantity}/{item.requiredQuantity} packed
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1">
        <p className="flex items-center gap-1 text-[12px] text-on-surface-variant">
          <Icon
            name={packed ? 'task_alt' : item.status === 'PICKED' ? 'radio_button_checked' : 'radio_button_unchecked'}
            size={18}
            className={packed ? 'text-primary' : 'text-tertiary'}
          />
          {harvestHint(item.status)}
        </p>
        <button
          type="button"
          disabled={busy || action.kind === 'done'}
          className={`inline-flex min-h-10 items-center gap-1 rounded-full px-4 text-[13px] font-bold transition disabled:opacity-50 ${
            action.kind === 'done'
              ? 'bg-primary text-white'
              : 'bg-secondary-fixed/50 text-secondary hover:bg-secondary-fixed md:bg-surface-low md:text-primary md:hover:bg-primary md:hover:text-white'
          }`}
          onClick={run}
        >
          <Icon name={action.icon} size={16} />
          {busy ? 'Updating…' : action.label}
        </button>
      </div>
    </article>
  );
}

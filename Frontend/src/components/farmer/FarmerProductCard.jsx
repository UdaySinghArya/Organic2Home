import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { inr } from '../../lib/format.js';
import { produceImage } from '../../lib/produceImages.js';
import { paths } from '../../lib/paths.js';

export default function FarmerProductCard({ product, busy, onToggle }) {
  const navigate = useNavigate();
  const img = produceImage(product);
  const active = product.status === 'ACTIVE' && product.availability !== false;
  const plot = [product.farm?.field, product.farm?.location].filter(Boolean).join(' · ');

  return (
    <article className="flex items-center gap-4 overflow-hidden rounded-[20px] bg-surface-lowest p-4 shadow-card">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[16px] bg-surface-container">
        {img ? (
          <img alt={product.name} src={img} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary">
            <Icon name="eco" size={28} />
          </div>
        )}
        <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 rounded-full bg-tertiary-fixed px-2 py-0.5 text-[11px] font-extrabold text-on-tertiary-fixed">
          <Icon name="eco" size={12} />
          Fresh
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-semibold">{product.name}</h2>
            <p className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-on-surface-variant">
              <Icon name="location_on" size={14} />
              {plot || 'Farm plot'}
            </p>
          </div>
          <button
            type="button"
            aria-label={`Edit ${product.name}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-outline hover:bg-surface-container hover:text-on-surface"
            onClick={() => navigate(paths.farmerProductEdit(product.id))}
          >
            <Icon name="more_vert" size={18} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between pt-1">
          <p className="ks-price tracking-tight">
            {inr(product.price)}{' '}
            <span className="text-[12px] font-medium text-on-surface-variant">/ {product.unit}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-extrabold ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
              {active ? 'In Stock' : product.status === 'OUT_OF_STOCK' ? 'Out of stock' : 'Resting'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              disabled={busy}
              className={`relative h-7 w-12 rounded-full p-0.5 transition ${
                active ? 'bg-primary' : 'bg-surface-container'
              }`}
              onClick={() => onToggle?.(product)}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-surface-lowest shadow-md transition ${
                  active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

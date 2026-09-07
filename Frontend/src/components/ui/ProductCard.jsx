import { Link } from 'react-router-dom';
import { KalAayegaBadge } from './Badge.jsx';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import QuantityStepper from './QuantityStepper.jsx';
import { produceImage } from '../../lib/produceImages.js';

export default function ProductCard({
  name,
  description,
  price,
  unit = 'kg',
  image,
  inStock = true,
  quantity = 0,
  to,
  onAdd,
  onQuantityChange,
}) {
  const src = produceImage({ name, image });
  const media = (
    <div className="relative mb-2 aspect-square overflow-hidden rounded-2xl bg-surface-low">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`h-full w-full object-cover ${inStock ? '' : 'opacity-70 grayscale'}`}
        />
      ) : null}
      {inStock ? (
        <KalAayegaBadge className="absolute top-2 left-2" />
      ) : (
        <span className="absolute top-2 left-2 rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-extrabold text-on-surface-variant">
          Back tomorrow
        </span>
      )}
    </div>
  );

  return (
    <article className="flex h-full flex-col justify-between rounded-[20px] border border-outline-soft bg-surface-lowest p-3 shadow-card transition hover:-translate-y-0.5">
      <div>
        {to ? <Link to={to}>{media}</Link> : media}
        <div className="mb-1 flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${inStock ? 'bg-primary' : 'bg-error'}`} />
          <span className={`ks-label ${inStock ? 'text-primary' : 'text-error'}`}>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>
        <h3 className="ks-subtitle line-clamp-1">{to ? <Link to={to}>{name}</Link> : name}</h3>
        {description ? <p className="ks-caption text-outline">{description}</p> : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="ks-price">
          ₹{price}
          <span className="ks-caption font-normal text-outline">/{unit}</span>
        </p>
        {!inStock ? (
          <span className="ks-caption text-outline">Unavailable</span>
        ) : quantity > 0 ? (
          <QuantityStepper value={quantity} onChange={onQuantityChange} min={0} />
        ) : (
          <Button variant="cta" className="min-h-8 px-3 text-[13px]" onClick={onAdd}>
            <Icon name="add" size={16} />
            Add
          </Button>
        )}
      </div>
    </article>
  );
}

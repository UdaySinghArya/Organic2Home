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
    <article className="flex h-full min-w-0 flex-col justify-between overflow-hidden rounded-[20px] border border-outline-soft bg-surface-lowest p-3 shadow-card transition hover:-translate-y-0.5">
      <div className="min-w-0">
        {to ? <Link to={to}>{media}</Link> : media}
        <div className="mb-1 flex items-center gap-1">
          <span className={`h-2 w-2 shrink-0 rounded-full ${inStock ? 'bg-primary' : 'bg-error'}`} />
          <span className={`ks-label ${inStock ? 'text-primary' : 'text-error'}`}>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>
        <h3 className="ks-subtitle line-clamp-1">{to ? <Link to={to}>{name}</Link> : name}</h3>
        {description ? <p className="ks-caption line-clamp-2 text-outline">{description}</p> : null}
      </div>
      <div className="mt-3 flex min-w-0 items-center justify-between gap-1.5">
        <p className="ks-price min-w-0 truncate">
          ₹{price}
          <span className="ks-caption font-normal text-outline">/{unit}</span>
        </p>
        {!inStock ? (
          <span className="ks-caption shrink-0 text-outline">Unavailable</span>
        ) : quantity > 0 ? (
          <QuantityStepper className="shrink-0" size="sm" value={quantity} onChange={onQuantityChange} min={0} />
        ) : (
          <Button variant="cta" size="sm" onClick={onAdd}>
            <Icon name="add" size={16} />
            Add
          </Button>
        )}
      </div>
    </article>
  );
}

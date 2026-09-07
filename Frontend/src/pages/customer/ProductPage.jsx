import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { KalAayegaBadge } from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import QuantityStepper from '../../components/ui/QuantityStepper.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { useCart } from '../../cart/CartContext.jsx';
import { BRAND_NAME, LOGO_SRC } from '../../lib/brand.js';
import { categoryLabel, harvestDateLabel, inr } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { produceImage } from '../../lib/produceImages.js';
import { customerService } from '../../services/customerService.js';

function categoryPlural(category) {
  if (category === 'fruits') return 'Fruits';
  if (category === 'vegetables') return 'Vegetables';
  return 'Home';
}

function farmLine(product) {
  const farm = product.farm || {};
  const name = farm.name || farm.field;
  if (name && farm.location) return `Direct from ${name} (${farm.location})`;
  if (name) return `Direct from ${name}`;
  return 'Harvested directly upon order lock at 8:00 PM';
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, quantityFor, add, setQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await customerService.getProduct(id);
        if (!cancelled) {
          setProduct(data.product);
          const existing = quantityFor(data.product.id);
          setQty(existing || 1);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setProduct(null);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // quantityFor is stable enough for first paint; re-init only when product id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const inCart = product ? quantityFor(product.id) : 0;
  const inStock = Boolean(product?.inStock);
  const image = produceImage(product);
  const lineTotal = product ? product.price * qty : 0;

  async function addToCart() {
    if (!product?.inStock) return;
    setBusy(true);
    try {
      if (inCart) await setQuantity(product.id, qty);
      else await add(product.id, qty);
      setAdded(true);
      setActionError('');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function back() {
    navigate(paths.home);
  }

  const ctaLabel = busy
    ? 'Adding…'
    : added || inCart
      ? `Update basket · ${inr(lineTotal)}`
      : `Add ${qty} ${product?.unit || ''} · ${inr(lineTotal)}`;

  return (
    <main className="ks-page pt-safe">
      <header className="sticky top-0 z-30 bg-surface/90 px-4 pt-safe backdrop-blur md:hidden">
        <div className="mx-auto flex h-16 max-w-[420px] items-center justify-between">
          <button
            type="button"
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-lowest shadow-sm"
            onClick={back}
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase ${
              inStock ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {inStock ? 'One Farmer Direct' : 'Harvest Booked Out'}
          </span>
          <div className="h-11 w-11" />
        </div>
      </header>

      <header className="hidden border-b border-outline-soft bg-surface/95 md:block">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-4 px-6">
          <Link to={paths.home} className="flex shrink-0 items-center gap-3">
            <img alt={BRAND_NAME} src={LOGO_SRC} className="h-10 w-10 rounded-full bg-surface-lowest object-contain" />
            <span className="text-[22px] font-extrabold tracking-tight">{BRAND_NAME}</span>
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 text-[11px] font-extrabold tracking-wider text-on-primary-fixed uppercase lg:inline-flex">
            Single Farmer Direct
          </span>
          <p className="hidden flex-1 text-center text-[12px] font-medium text-on-surface-variant xl:block">
            Daily harvest cutoff: 8:00 PM tonight
          </p>
          <nav className="flex items-center gap-2 text-[13px] font-bold">
            <Link to={paths.home} className="rounded-full px-4 py-1 text-on-surface-variant hover:text-primary">
              Harvest Market
            </Link>
            <Link to={paths.orders} className="rounded-full px-4 py-1 text-on-surface-variant hover:text-primary">
              Orders
            </Link>
            <Link
              to={paths.cart}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-white shadow-sm"
            >
              Cart
              {cart.itemCount > 0 ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-container text-[11px]">
                  {cart.itemCount}
                </span>
              ) : null}
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1080px] px-4 pt-2 pb-32 md:px-6 md:pt-6 md:pb-12">
        {loading ? <LoadingState /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : null}

        {product ? (
          <>
            <button
              type="button"
              className="mb-5 hidden items-center gap-2 rounded-full bg-surface-lowest px-4 py-2 text-[13px] font-bold shadow-sm md:inline-flex"
              onClick={back}
            >
              <Icon name="arrow_back" size={16} />
              Back to {categoryPlural(product.category)}
            </button>

            <div className="grid items-start gap-5 md:grid-cols-12 md:gap-8">
              <section className="rounded-[20px] border border-outline-soft bg-surface-lowest p-5 shadow-card md:col-span-7 md:p-8">
                <div className="relative">
                  {inStock ? (
                    <KalAayegaBadge className="absolute top-0 left-0 z-10">
                      Kal farm se aayega · {harvestDateLabel()}
                    </KalAayegaBadge>
                  ) : (
                    <span className="absolute top-0 left-0 z-10 inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-[12px] font-bold text-on-surface-variant">
                      <span className="h-2 w-2 rounded-full bg-outline" />
                      Back tomorrow
                    </span>
                  )}
                  <div
                    className={`mt-2 overflow-hidden rounded-2xl bg-surface-low ${
                      inStock ? 'aspect-square md:aspect-[4/3]' : 'aspect-square md:aspect-[4/3]'
                    }`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className={`h-full w-full object-cover ${inStock ? '' : 'opacity-75 grayscale'}`}
                      />
                    ) : null}
                  </div>
                </div>
                {!inStock ? (
                  <p className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-on-surface-variant">
                    <span className="h-2 w-2 rounded-full bg-tertiary" />
                    Daily harvest quota reached for {harvestDateLabel()}
                  </p>
                ) : (
                  <div className="mt-4 hidden items-center justify-between border-t border-outline-soft pt-4 text-[12px] font-semibold text-on-surface-variant md:flex">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Harvested directly upon order lock at 8:00 PM
                    </span>
                    <span className="text-outline">Zero Cold Storage Guaranteed</span>
                  </div>
                )}
              </section>

              <div className="flex flex-col gap-5 md:col-span-5">
                <section className="rounded-[20px] border border-outline-soft bg-surface-lowest p-6 shadow-card">
                  <span
                    className={`mb-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider uppercase ${
                      inStock ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'
                    }`}
                  >
                    {inStock ? 'Field Fresh' : 'Unavailable'}
                  </span>
                  <h1 className="ks-display">{product.name}</h1>
                  <p className="mt-1 text-[16px] font-bold text-on-surface-variant md:text-[20px]">
                    {categoryLabel(product.category)} · {inr(product.price)} / {product.unit}
                  </p>
                  <p className="ks-body mt-3 border-t border-outline-soft pt-3 text-on-surface-variant">
                    {product.description || 'Picked tomorrow morning from our field'}
                  </p>
                  {inStock ? (
                    <div className="mt-4 hidden rounded-xl bg-surface p-4 text-[12px] text-on-surface-variant md:block">
                      <p className="flex items-center gap-2 font-bold text-on-surface">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                          ✓
                        </span>
                        {farmLine(product)}
                      </p>
                      <p className="mt-1 pl-7 text-outline">
                        Soil-to-kitchen turnaround in under 14 hours. No middlemen mandi sorting.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-outline-soft bg-surface p-3.5 text-[12px] text-on-surface-variant">
                      <p className="font-bold text-on-surface">Fresh harvest capacity reached for tomorrow morning.</p>
                      <p className="mt-1 text-outline">We do not source warehouse surplus or cold-storage lots.</p>
                    </div>
                  )}
                </section>

                <section
                  className={`rounded-[20px] border border-outline-soft bg-surface-lowest p-5 shadow-card md:p-8 ${
                    inStock ? '' : 'opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="ks-label text-outline">
                      <span className="md:hidden">Select Weight</span>
                      <span className="hidden md:inline">Quantity</span>
                    </p>
                      <p className="ks-caption text-outline">
                        {inStock ? `Min 1 ${product.unit}` : 'Back tomorrow'}
                      </p>
                    </div>
                    <QuantityStepper
                      size="lg"
                      value={qty}
                      min={1}
                      max={inStock ? product.stockQuantity || 99 : 1}
                      suffix={product.unit}
                      disabled={!inStock}
                      onChange={setQty}
                    />
                  </div>
                  <div className="mt-6 hidden md:block">
                    {inStock ? (
                      <Button className="h-14 w-full text-[17px]" disabled={busy} onClick={addToCart}>
                        {ctaLabel}
                        <Icon name="arrow_forward" size={18} />
                      </Button>
                    ) : (
                      <Button className="h-14 w-full bg-outline text-[17px]" disabled>
                        Not picking today
                      </Button>
                    )}
                  </div>
                </section>
              </div>
            </div>

            {actionError ? <p className="mt-4 text-[12px] font-medium text-secondary">{actionError}</p> : null}
          </>
        ) : null}
      </div>

      {product ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-soft bg-surface/95 p-4 pb-safe backdrop-blur md:hidden">
          {inStock ? (
            <Button className="h-14 w-full text-[17px]" disabled={busy} onClick={addToCart}>
              {ctaLabel}
              <Icon name="arrow_forward" size={18} />
            </Button>
          ) : (
            <Button className="h-14 w-full bg-outline text-[17px]" disabled>
              Not picking today
            </Button>
          )}
        </div>
      ) : null}
    </main>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import CutoffBar from '../../components/layout/CutoffBar.jsx';
import HarvestTimeline from '../../components/cart/HarvestTimeline.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Dialog from '../../components/ui/Dialog.jsx';
import Icon from '../../components/ui/Icon.jsx';
import QuantityStepper from '../../components/ui/QuantityStepper.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { useCart } from '../../cart/CartContext.jsx';
import { EMPTY_BASKET_SRC } from '../../lib/brand.js';
import { deliverySlotLabel, harvestDateLabel, inr } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { produceImage } from '../../lib/produceImages.js';

function farmCaption(product) {
  const farm = product?.farm || {};
  return [farm.name, farm.location].filter(Boolean).join(', ');
}

function unavailableCopy(reason) {
  if (reason === 'OUT_OF_STOCK') return 'Harvest booked out for tomorrow';
  if (reason === 'UNAVAILABLE') return 'This item is resting this week';
  return 'This item is no longer available';
}

function CartItem({ item, busy, onQuantity, onRemove }) {
  const product = item.product;
  const unit = product?.unit || 'kg';
  const image = produceImage(product);
  const available = item.available;

  return (
    <div
      className={`flex items-center justify-between gap-3 ${available ? '' : 'opacity-80'}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-surface-low md:h-20 md:w-20">
          {image ? (
            <img
              src={image}
              alt={product?.name || 'Produce'}
              className={`h-full w-full object-cover ${available ? '' : 'grayscale'}`}
            />
          ) : null}
          {available ? (
            <span className="absolute top-1 left-1 rounded-full bg-tertiary-fixed px-1.5 py-0.5 text-[10px] font-extrabold text-on-tertiary-fixed">
              Kal aayega
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold">{product?.name || 'Unavailable item'}</p>
          {farmCaption(product) ? (
            <p className="hidden text-[12px] text-on-surface-variant md:block">{farmCaption(product)}</p>
          ) : null}
          <p className="mt-0.5 text-[13px] text-on-surface-variant">
            {item.quantity} {unit} · {inr(item.subtotal)}
          </p>
          <p className="hidden text-[12px] text-outline md:block">({inr(item.unitPrice)}/{unit})</p>
          {!available ? (
            <p className="mt-1 text-[12px] font-medium text-secondary">{unavailableCopy(item.unavailableReason)}</p>
          ) : null}
          {item.priceChanged ? (
            <p className="mt-1 text-[12px] font-medium text-tertiary">Price updated to {inr(item.unitPrice)}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {available ? (
          <QuantityStepper
            value={item.quantity}
            min={0}
            max={product?.stockQuantity || 99}
            suffix={unit}
            disabled={busy}
            onChange={(qty) => onQuantity(item.productId, qty)}
          />
        ) : null}
        <button
          type="button"
          aria-label="Remove"
          className="rounded-full p-1.5 text-outline hover:bg-error-container hover:text-error"
          disabled={busy}
          onClick={() => onRemove(item.productId)}
        >
          <Icon name="delete" size={20} />
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, error, refresh, setQuantity, remove, clear } = useCart();
  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const empty = !loading && !error && cart.items.length === 0;
  const canCheckout = cart.itemCount > 0;

  async function changeQty(productId, qty) {
    setBusyId(productId);
    try {
      await setQuantity(productId, qty);
      setActionError('');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId('');
    }
  }

  async function removeItem(productId) {
    setBusyId(productId);
    try {
      await remove(productId);
      setActionError('');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId('');
    }
  }

  async function clearBasket() {
    try {
      await clear();
      setActionError('');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setConfirmClear(false);
    }
  }

  return (
    <CustomerShell title="Cart">
      {loading && !cart.items.length ? <LoadingState label="Loading basket…" /> : null}
      {error && !cart.items.length ? <ErrorState message={error} onRetry={() => refresh()} /> : null}

      {empty ? (
        <div className="mx-auto flex max-w-md flex-col items-center px-2 pt-8 text-center">
          <img
            src={EMPTY_BASKET_SRC}
            alt="Empty rustic woven harvest basket"
            className="mb-6 h-56 w-56 object-contain"
          />
          <h1 className="ks-headline">Cart is empty</h1>
          <p className="mt-1 text-[16px] text-on-surface-variant">Add some farm fresh veg</p>
          <Button className="mt-8 w-full max-w-xs" onClick={() => navigate(paths.home)}>
            Shop vegetables
            <Icon name="arrow_forward" size={18} />
          </Button>
          <div className="mt-12 hidden w-full grid-cols-3 gap-3 md:grid">
            {[
              ['agriculture', 'Zero Middlemen'],
              ['schedule', 'Dawn Delivery'],
              ['verified', 'Direct from Soil'],
            ].map(([icon, label]) => (
              <div key={label} className="rounded-[16px] bg-surface-lowest p-4 shadow-card">
                <Icon name={icon} size={24} className="text-primary" />
                <p className="ks-label mt-1 text-on-surface">{label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!empty ? (
        <div className="pb-24 md:pb-0">
          <CutoffBar />
          <div className="grid items-start gap-6 md:grid-cols-12">
            <div className="flex flex-col gap-4 md:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="ks-headline">Your cart</h1>
                    <span className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-extrabold text-on-surface-variant">
                      {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <p className="mt-1 text-[14px] text-on-surface-variant">
                    Picked at dusk tonight, directly from the field.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-[13px] font-bold text-secondary"
                  onClick={() => setConfirmClear(true)}
                >
                  Clear
                </button>
              </div>

              <div className="flex items-start gap-3 rounded-[20px] bg-tertiary-fixed/70 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-lowest text-tertiary">
                  <Icon name="wb_sunny" size={20} filled />
                </span>
                <div>
                  <p className="text-[14px] font-bold">
                    Delivered {harvestDateLabel()}, 7–10 AM
                  </p>
                  <p className="ks-caption text-on-surface-variant">{deliverySlotLabel()} · from the field</p>
                </div>
              </div>

              {actionError ? <p className="text-[12px] font-medium text-secondary">{actionError}</p> : null}

              <Card className="flex flex-col gap-4" padded>
                {cart.items.map((item, index) => (
                  <div key={item.productId}>
                    {index > 0 ? <div className="mb-4 h-px bg-surface-container" /> : null}
                    <CartItem
                      item={item}
                      busy={Boolean(busyId)}
                      onQuantity={changeQty}
                      onRemove={removeItem}
                    />
                  </div>
                ))}
              </Card>

              <div className="hidden items-center gap-2 rounded-[16px] bg-surface-low px-4 py-3 text-[12px] font-medium text-on-surface-variant md:flex">
                <Icon name="eco" size={18} className="text-primary" />
                100% farm direct • Zero warehouse cold storage • Harvested upon order lock at dusk
              </div>

              <Card className="flex items-center justify-between md:hidden">
                <p className="text-[17px] font-semibold">Total</p>
                <p className="text-[22px] font-extrabold">{inr(cart.total)}</p>
              </Card>
            </div>

            <aside className="hidden md:col-span-5 md:flex md:flex-col md:gap-4">
              <Card className="sticky top-24 flex flex-col gap-5 p-6">
                <div className="flex items-center justify-between border-b border-outline-soft pb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="receipt_long" size={20} className="text-primary" />
                    <h2 className="ks-subtitle">Bill Summary</h2>
                  </div>
                  <span className="ks-caption text-on-surface-variant">Delivery at checkout</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="ks-caption text-on-surface-variant">Items total</span>
                  <span className="font-bold">{inr(cart.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-outline-soft pt-3">
                  <span className="ks-subtitle">To pay</span>
                  <span className="text-[28px] font-extrabold">{inr(cart.total)}</span>
                </div>
                <Button
                  className="w-full"
                  disabled={!canCheckout}
                  onClick={() => navigate(paths.checkout)}
                >
                  Checkout {inr(cart.total)}
                  <Icon name="arrow_forward" size={18} />
                </Button>
                <p className="text-center text-[12px] font-medium text-on-surface-variant">
                  Zero middlemen • Soil freshness guaranteed
                </p>
              </Card>
              <HarvestTimeline />
            </aside>
          </div>

          <div className="fixed inset-x-0 bottom-16 z-40 bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
            <Button
              className="h-12 w-full text-[16px]"
              disabled={!canCheckout}
              onClick={() => navigate(paths.checkout)}
            >
              {canCheckout ? `Checkout ${inr(cart.total)}` : 'Cart items unavailable'}
              <Icon name="arrow_forward" size={16} />
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog
        open={confirmClear}
        title="Clear the harvest basket?"
        confirmLabel="Clear cart"
        onClose={() => setConfirmClear(false)}
        onConfirm={clearBasket}
      >
        All reserved produce will be released back to tomorrow’s harvest.
      </Dialog>
    </CustomerShell>
  );
}

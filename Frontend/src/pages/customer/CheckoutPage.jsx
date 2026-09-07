import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { useCart } from '../../cart/CartContext.jsx';
import { addressHeadline } from '../../lib/address.js';
import { deliverySlotLabel, formatAddress, inr, isPastCutoff } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { customerService } from '../../services/customerService.js';

const METHODS = [
  {
    id: 'UPI',
    title: 'UPI',
    body: 'Google Pay, PhonePe, Paytm · Instant & zero fees',
    extra: 'Instant settlement direct to farmer',
  },
  { id: 'CARD', title: 'Credit / Debit Card', body: 'Visa, Mastercard, RuPay' },
  { id: 'COD', title: 'Cash on delivery', body: 'Pay when produce reaches your door' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, refresh, error: cartError } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [picker, setPicker] = useState(false);
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [addr] = await Promise.all([customerService.listAddresses(), refresh()]);
      setAddresses(addr.addresses || []);
      setAddressId(addr.defaultAddress?.id || addr.addresses?.[0]?.id || '');
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refresh]);

  useEffect(() => {
    if (!loading && !loadError && !cartError && cart.items.length === 0) {
      navigate(paths.cart, { replace: true });
    }
  }, [loading, loadError, cartError, cart.items.length, navigate]);

  const selected = addresses.find((item) => item.id === addressId);

  async function placeOrder() {
    if (!addressId) {
      setError('Please add a delivery address');
      return;
    }
    setPlacing(true);
    try {
      const data = await customerService.placeOrder({ addressId, paymentMethod: method });
      await refresh();
      const order = data.order;
      if (method === 'COD') {
        navigate(`${paths.orderSuccess}?orderId=${order.id}`, { replace: true });
      } else {
        navigate(`${paths.payment}?orderId=${order.id}`, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  const cta = placing
    ? 'Placing order…'
    : method === 'COD'
      ? 'Place order'
      : `Pay ${inr(cart.total)}`;

  return (
    <CustomerShell title="Checkout Flow" showNav={false} onBack={() => navigate(paths.cart)}>
      {loading ? <LoadingState /> : null}
      {!loading && (loadError || cartError) ? (
        <ErrorState message={loadError || cartError} onRetry={load} />
      ) : null}

      {!loading && !loadError && !cartError ? (
        <div className="mx-auto max-w-[960px]">
          <button
            type="button"
            className="mb-5 hidden items-center gap-2 text-[15px] font-bold text-primary md:inline-flex"
            onClick={() => navigate(paths.cart)}
          >
            <Icon name="arrow_back" size={16} />
            Back to Cart
          </button>
          <div className="mb-6 hidden md:block">
            <h1 className="ks-headline">Place order</h1>
            <p className="mt-1 text-on-surface-variant">
              Review your harvest delivery slot and select a payment method.
            </p>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-12">
            <div className="flex flex-col gap-3 md:col-span-7">
              {isPastCutoff() ? (
                <div className="flex items-start gap-2 rounded-[20px] bg-tertiary-fixed/40 p-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed">
                    <Icon name="schedule" size={16} className="text-tertiary" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-tertiary">Post-8 PM harvest notice</p>
                    <p className="ks-caption mt-0.5 text-on-surface-variant">
                      Cutoff over. This fresh batch will be harvested at dawn and arrive day after tomorrow.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="hidden items-start gap-3 rounded-[20px] bg-tertiary-fixed/35 p-4 md:flex">
                  <Icon name="info" size={20} className="text-tertiary" />
                  <div>
                    <p className="text-[13px] font-bold">Harvest Cutoff Notice</p>
                    <p className="ks-caption mt-1 text-on-surface-variant">
                      Orders placed after 8:00 PM will be harvested tomorrow dusk and delivered day after tomorrow
                      morning.
                    </p>
                  </div>
                </div>
              )}

              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <p className="ks-label text-outline">Delivering to</p>
                  <button
                    type="button"
                    className="text-[13px] font-bold text-primary"
                    onClick={() => setPicker((open) => !open)}
                  >
                    {picker ? 'Done' : 'Change'}
                  </button>
                </div>
                {selected ? (
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-surface-low text-primary">
                      <Icon name="home" size={14} filled />
                    </span>
                    <div>
                      <p className="font-bold">{addressHeadline(selected)}</p>
                      <p className="ks-caption text-outline">{formatAddress(selected)}</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate(`${paths.addressNew}?from=checkout`)}
                  >
                    Add address
                  </Button>
                )}
                {picker ? (
                  <div className="mt-4 flex flex-col gap-2">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => {
                          setAddressId(address.id);
                          setPicker(false);
                        }}
                        className={`rounded-2xl p-3 text-left ${
                          address.id === addressId ? 'bg-surface-low' : 'bg-surface'
                        }`}
                      >
                        <p className="font-bold">
                          {address.label} {address.isDefault ? '· Default' : ''}
                        </p>
                        <p className="ks-caption text-on-surface-variant">{formatAddress(address)}</p>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="text-left text-[13px] font-bold text-primary"
                      onClick={() => navigate(`${paths.addressNew}?from=checkout`)}
                    >
                      + Add new address
                    </button>
                    <button
                      type="button"
                      className="text-left text-[13px] font-bold text-on-surface-variant"
                      onClick={() => navigate(`${paths.addresses}?from=checkout`)}
                    >
                      Manage saved addresses
                    </button>
                  </div>
                ) : null}
                {selected ? (
                  <div className="mt-4 hidden items-center gap-2 border-t border-outline-soft pt-3 md:flex">
                    <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-1 text-[11px] font-extrabold">
                      <Icon name="wb_sunny" size={13} filled />
                      Kal Aayega
                    </span>
                    <span className="ks-caption text-on-surface-variant">
                      Delivered {deliverySlotLabel().toLowerCase()} · from the field
                    </span>
                  </div>
                ) : null}
              </Card>

              <Card>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed/60">
                    <Icon name="wb_sunny" size={18} filled className="text-tertiary" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{deliverySlotLabel()}</p>
                      <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-extrabold text-primary">
                        direct from field
                      </span>
                    </div>
                    <p className="ks-caption mt-1 text-outline">Harvested directly upon order lock at 8 PM</p>
                  </div>
                </div>
              </Card>

              <Card>
                <p className="ks-label mb-3 text-outline">Payment method</p>
                <div className="flex flex-col gap-2">
                  {METHODS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id)}
                      className={`rounded-2xl p-3 text-left transition ${
                        method === item.id
                          ? 'bg-surface-low ring-2 ring-primary'
                          : 'bg-transparent hover:bg-surface-low/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full ${
                            method === item.id ? 'bg-primary' : 'bg-surface-container'
                          }`}
                        >
                          {method === item.id ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{item.title}</p>
                            {item.id === 'UPI' ? (
                              <span className="rounded-full bg-primary-fixed px-2 py-0.5 text-[11px] font-extrabold text-on-primary-fixed">
                                Preferred
                              </span>
                            ) : null}
                          </div>
                          <p className="ks-caption text-outline">{item.body}</p>
                          {item.extra && method === item.id ? (
                            <p className="mt-1 text-[12px] font-semibold text-primary">{item.extra}</p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="flex items-center justify-between md:hidden">
                <p className="text-on-surface-variant">
                  {cart.itemCount} items · <span className="font-medium text-primary">Morning Batch</span>
                </p>
                <p className="text-[30px] font-extrabold leading-none">{inr(cart.total)}</p>
              </Card>
              <p className="ks-caption text-outline md:hidden">
                Basket total from the farm. Delivery is added by the server when you place the order.
              </p>
            </div>

            <aside className="hidden md:col-span-5 md:block">
              <Card className="sticky top-24 flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="ks-subtitle">Order summary</h2>
                  <span className="ks-label text-outline">{cart.itemCount} items</span>
                </div>
                <div className="flex flex-col gap-3">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.product?.name || 'Produce'}</p>
                        <p className="ks-caption text-on-surface-variant">
                          {item.quantity} {item.product?.unit || 'kg'}
                          {item.available ? '' : ' · unavailable'}
                        </p>
                      </div>
                      <p className="ks-price">{inr(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline justify-between rounded-2xl bg-surface-low px-4 py-4">
                  <div>
                    <p className="font-bold">Basket total</p>
                    <p className="ks-caption text-outline">Farm confirms delivery on place</p>
                  </div>
                  <p className="text-[32px] font-extrabold">{inr(cart.total)}</p>
                </div>
                {error && !loading ? <p className="text-[12px] font-medium text-secondary">{error}</p> : null}
                <Button
                  className="w-full"
                  disabled={placing || !cart.itemCount || !addressId}
                  onClick={placeOrder}
                >
                  {cta}
                  <Icon name="arrow_forward" size={18} />
                </Button>
                <p className="text-center text-[12px] text-on-surface-variant">
                  Guaranteed fresh or replacement delivered next dawn
                </p>
              </Card>
            </aside>
          </div>

          {error && !loading ? <p className="mt-3 text-[12px] font-medium text-secondary md:hidden">{error}</p> : null}

          <div className="sticky bottom-4 mt-6 md:hidden">
            <Button
              variant="harvest"
              className="w-full"
              disabled={placing || !cart.itemCount || !addressId}
              onClick={placeOrder}
            >
              {cta}
              <Icon name="arrow_forward" size={18} />
            </Button>
            <p className="mt-2 text-center text-[12px] text-on-surface-variant">
              Guaranteed fresh or replacement delivered next dawn
            </p>
          </div>
        </div>
      ) : null}
    </CustomerShell>
  );
}

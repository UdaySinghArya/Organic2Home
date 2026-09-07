import { Link, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../ui/BottomNav.jsx';
import Icon from '../ui/Icon.jsx';
import { useCart } from '../../cart/CartContext.jsx';
import { BRAND_NAME, LOGO_SRC } from '../../lib/brand.js';
import { inr } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';

export default function CustomerShell({
  children,
  title,
  subtitle,
  greeting,
  showBasket = false,
  showNav = true,
  onBack,
}) {
  const { cart } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <main className="ks-page pt-safe">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-outline-soft/70 bg-surface/95 pt-safe backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {onBack ? (
              <button
                type="button"
                aria-label="Go back"
                className="mr-1 flex h-10 w-10 items-center justify-center rounded-full bg-surface-lowest shadow-sm"
                onClick={onBack}
              >
                <Icon name="arrow_back" size={20} />
              </button>
            ) : (
              <img alt={BRAND_NAME} src={LOGO_SRC} className="h-8 w-8 rounded-full object-contain" />
            )}
            <div className="min-w-0">
              {greeting ? (
                <>
                  <p className="ks-label text-outline">Morning Harvest</p>
                  <p className="ks-subtitle truncate tracking-tight">{greeting}</p>
                </>
              ) : (
                <>
                  <p className="text-[17px] font-extrabold leading-none tracking-tight">{BRAND_NAME}</p>
                  <p className="ks-caption text-on-surface-variant">{subtitle || title}</p>
                </>
              )}
            </div>
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            {[
              [paths.home, 'Harvest Market'],
              [paths.orders, 'Orders'],
              [paths.cart, 'Cart'],
              [paths.profile, 'Profile'],
            ].map(([to, label]) => {
              const account = to === paths.profile;
              const active = account
                ? pathname === paths.profile || pathname === paths.help || pathname.startsWith('/addresses')
                : pathname === to || (to !== paths.home && pathname.startsWith(to) && to !== paths.profile);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`rounded-full px-4 py-1 text-[13px] font-bold ${
                    active ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            aria-label="Profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
            onClick={() => navigate(paths.profile)}
          >
            <Icon name="person" size={18} />
          </button>
        </div>
      </header>

      <div className={`mx-auto w-full max-w-[1080px] px-4 pt-20 md:px-6 ${showNav ? 'pb-28 md:pb-10' : 'pb-10'}`}>
        {children}
      </div>

      {showBasket && cart.itemCount > 0 ? (
        <div className="fixed inset-x-0 bottom-[4.5rem] z-40 px-4 md:bottom-8">
          <div className="mx-auto flex max-w-md items-center justify-between rounded-full bg-inverse-surface px-3 py-2 text-inverse-on-surface shadow-lift md:max-w-[540px]">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <Icon name="shopping_bag" size={18} />
              </span>
              <p className="text-[13px] font-bold">
                {cart.itemCount} items in bag • {inr(cart.subtotal)}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-secondary-container px-4 py-2 text-[13px] font-bold text-white"
              onClick={() => navigate(paths.cart)}
            >
              View Basket →
            </button>
          </div>
        </div>
      ) : null}

      {showNav ? <div className="md:hidden"><BottomNav cartCount={cart.itemCount} /></div> : null}
    </main>
  );
}

export { LOGO_SRC };

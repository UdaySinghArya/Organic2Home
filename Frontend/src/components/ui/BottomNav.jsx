import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import { paths } from '../../lib/paths.js';

const items = [
  { to: paths.home, icon: 'home', label: 'Home', end: true },
  { to: paths.cart, icon: 'shopping_bag', label: 'Cart', end: true },
  { to: paths.orders, icon: 'receipt_long', label: 'Orders' },
  { to: paths.profile, icon: 'person', label: 'Profile' },
];

function isItemActive(item, pathname, navActive) {
  if (item.to === paths.profile) {
    return pathname === paths.profile || pathname === paths.help || pathname.startsWith('/addresses');
  }
  return navActive;
}

export default function BottomNav({ cartCount = 0 }) {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-soft bg-surface/95 pb-safe shadow-[0_-4px_20px_0_rgba(31,42,34,0.06)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[420px] items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="relative flex flex-col items-center gap-0.5 text-[11px] font-bold"
          >
            {({ isActive }) => {
              const active = isItemActive(item, pathname, isActive);
              return (
                <>
                  <span className={active ? 'text-primary' : 'text-outline'}>
                    <Icon name={item.icon} size={22} filled={active} />
                  </span>
                  <span className={active ? 'text-primary' : 'text-outline'}>{item.label}</span>
                  {item.to === paths.cart && cartCount > 0 ? (
                    <span className="absolute -top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

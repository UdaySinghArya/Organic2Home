import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { BRAND_NAME, LOGO_SRC } from '../../lib/brand.js';
import { farmNameOf, farmerSection } from '../../lib/farmerUi.js';
import { paths } from '../../lib/paths.js';

const items = [
  { to: paths.farmerDashboard, icon: 'agriculture', label: 'Harvest' },
  { to: paths.farmerProducts, icon: 'potted_plant', label: 'Products' },
  { to: paths.farmerOrders, icon: 'receipt_long', label: 'Orders' },
  { to: paths.farmerProfile, icon: 'person', label: 'Profile' },
];

function isItemActive(item, pathname) {
  if (item.to === paths.farmerDashboard) {
    return pathname === paths.farmerDashboard || pathname === paths.farmerHarvest;
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export default function FarmerShell({ children, onBack, showNav = true, headerTitle }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const farmName = farmNameOf(user);
  const section = farmerSection(pathname);
  const desktopNav = items.filter((item) => item.to !== paths.farmerProfile);

  return (
    <main className="ks-page-farmer pt-safe">
      <header className="fixed inset-x-0 top-0 z-40 bg-surface-green/90 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {onBack ? (
              <button
                type="button"
                aria-label="Go back"
                className="mr-1 flex h-11 w-11 items-center justify-center rounded-full text-on-surface hover:bg-surface-container"
                onClick={onBack}
              >
                <Icon name="arrow_back" size={22} />
              </button>
            ) : (
              <img alt={BRAND_NAME} src={LOGO_SRC} className="h-8 w-8 rounded-full object-contain" />
            )}
            <div className="min-w-0">
              {onBack ? (
                <p className="truncate text-[17px] font-semibold tracking-tight">{headerTitle || section}</p>
              ) : (
                <>
                  <p className="truncate text-[17px] font-semibold leading-none tracking-tight md:hidden">{BRAND_NAME} Farmer</p>
                  <p className="hidden truncate text-[13px] font-bold leading-none md:block">{farmName}</p>
                  <p className="mt-0.5 hidden text-[12px] font-medium text-on-surface-variant md:block">
                    {BRAND_NAME} Farmer Admin
                  </p>
                  <p className="mt-1 text-[11px] font-extrabold tracking-wider text-on-surface-variant uppercase md:hidden">
                    {section}
                  </p>
                </>
              )}
            </div>
          </div>

          {showNav ? (
            <nav className="hidden items-center gap-1 rounded-full bg-surface-low p-1 md:flex">
              {desktopNav.map((item) => {
                const active = isItemActive(item, pathname);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === paths.farmerDashboard}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition ${
                      active
                        ? 'bg-primary-container text-on-primary-container'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          ) : <div className="hidden md:block" />}

          <button
            type="button"
            aria-label="Farmer profile"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white"
            onClick={() => navigate(paths.farmerProfile)}
          >
            <Icon name="person" size={18} />
          </button>
        </div>
      </header>

      <div className={`mx-auto w-full max-w-[1080px] px-4 pt-20 md:px-6 ${showNav ? 'pb-28 md:pb-10' : 'pb-10'}`}>
        {children}
      </div>

      {showNav ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 bg-surface-green/90 pb-safe shadow-[0_-4px_20px_0_rgba(31,42,34,0.05)] backdrop-blur-xl md:hidden">
          <div className="mx-auto flex h-16 max-w-[480px] items-center justify-around px-4">
            {items.map((item) => {
              const active = isItemActive(item, pathname);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === paths.farmerDashboard}
                  className={`flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold transition ${
                    active ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  <span className={active ? 'inline' : 'hidden'}>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      ) : null}
    </main>
  );
}

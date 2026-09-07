import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { LoadingState } from '../components/ui/States.jsx';
import { paths } from '../lib/paths.js';
import { readPendingAuth } from '../lib/pendingAuth.js';

function SessionSplash() {
  return (
    <main className="ks-page flex min-h-dvh items-center justify-center px-4">
      <LoadingState label="Restoring harvest session…" />
    </main>
  );
}

function returnTo(location) {
  return `${location.pathname}${location.search || ''}`;
}

export function CustomerRoute({ children }) {
  const { ready, isCustomer, isAdmin } = useAuth();
  const location = useLocation();
  if (!ready) return <SessionSplash />;
  if (isAdmin) return <Navigate to={paths.farmerDashboard} replace />;
  if (!isCustomer) {
    return <Navigate to={paths.login} replace state={{ from: returnTo(location) }} />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { ready, isAdmin, isCustomer } = useAuth();
  const location = useLocation();
  if (!ready) return <SessionSplash />;
  if (isCustomer) return <Navigate to={paths.home} replace />;
  if (!isAdmin) {
    return <Navigate to={paths.farmerLogin} replace state={{ from: returnTo(location) }} />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const { ready, isCustomer, isAdmin } = useAuth();
  if (!ready) return <SessionSplash />;
  if (readPendingAuth()?.phone) return children;
  if (isCustomer) return <Navigate to={paths.home} replace />;
  if (isAdmin) return <Navigate to={paths.farmerDashboard} replace />;
  return children;
}

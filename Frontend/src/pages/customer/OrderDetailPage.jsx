import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import OrderDetailBody from '../../components/orders/OrderDetailBody.jsx';
import { ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { inr } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { customerService } from '../../services/customerService.js';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id === 'success') {
      navigate(paths.orderSuccess, { replace: true });
      return;
    }
    customerService
      .getOrder(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message));
  }, [id, navigate]);

  return (
    <CustomerShell title={order ? `Order #${order.orderNumber}` : 'Order'} showNav={false} onBack={() => navigate(paths.orders)}>
      <div className="mx-auto w-full max-w-md md:max-w-[640px]">
        {!order && !error ? <LoadingState /> : null}
        {error ? <ErrorState message={error} onRetry={() => navigate(paths.orders)} /> : null}
        {order ? (
          <>
            <div className="mb-3 flex items-center justify-between md:hidden">
              <h1 className="text-[20px] font-bold tracking-tight">Order #{order.orderNumber}</h1>
              <span className="text-[18px] font-extrabold text-primary">{inr(order.total)}</span>
            </div>
            <div className="hidden md:block">
              <OrderDetailBody
                order={order}
                variant="desktop"
                onHelp={() => navigate(paths.help)}
                onShop={() => navigate(paths.home)}
                onRetryPayment={() => navigate(`${paths.payment}?orderId=${order.id}`)}
              />
            </div>
            <div className="md:hidden">
              <OrderDetailBody
                order={order}
                variant="page"
                onHelp={() => navigate(paths.help)}
                onShop={() => navigate(paths.home)}
                onRetryPayment={() => navigate(`${paths.payment}?orderId=${order.id}`)}
              />
            </div>
          </>
        ) : null}
      </div>
    </CustomerShell>
  );
}

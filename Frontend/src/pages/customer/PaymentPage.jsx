import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { inr } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { customerService } from '../../services/customerService.js';

const POLL_MS = 2500;
const TIMEOUT_MS = 90_000;

export default function PaymentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const startedAt = useRef(Date.now());

  function goSuccess() {
    navigate(`${paths.orderSuccess}?orderId=${orderId}`, { replace: true });
  }

  function goFailed(reason) {
    const query = reason
      ? `?orderId=${orderId}&reason=${encodeURIComponent(reason)}`
      : `?orderId=${orderId}`;
    navigate(`${paths.paymentFailed}${query}`, { replace: true });
  }

  async function startCheckout() {
    if (!orderId) {
      navigate(paths.orders, { replace: true });
      return;
    }
    setStatus('loading');
    setError('');
    startedAt.current = Date.now();
    try {
      const existing = await customerService.getOrder(orderId);
      setOrder(existing.order);
      if (existing.order.paymentStatus === 'SUCCESS' || existing.order.paymentMethod === 'COD') {
        goSuccess();
        return;
      }
      const initiated = await customerService.initiatePayment({ orderId });
      setCheckout(initiated.checkout);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  useEffect(() => {
    startCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (!orderId || status !== 'ready') return undefined;

    const poll = setInterval(async () => {
      try {
        const data = await customerService.getPayment(orderId);
        if (data.payment?.status === 'SUCCESS') {
          goSuccess();
          return;
        }
        if (data.payment?.status === 'FAILED') {
          goFailed(data.payment.failureReason);
          return;
        }
        if (Date.now() - startedAt.current > TIMEOUT_MS) {
          await customerService.timeoutPayment({ orderId }).catch(() => {});
          goFailed('Payment timed out. The harvest is still reserved.');
        }
      } catch {
        /* keep waiting through transient network errors */
      }
    }, POLL_MS);

    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, status]);

  async function confirmDev() {
    setStatus('verifying');
    setError('');
    try {
      const data = await customerService.confirmDevPayment({ orderId });
      if (data.payment?.status === 'SUCCESS') goSuccess();
      else goFailed(data.payment?.failureReason || 'Payment was not verified');
    } catch (err) {
      goFailed(err.message);
    }
  }

  async function cancel() {
    setStatus('verifying');
    try {
      await customerService.cancelPayment({ orderId });
    } catch {
      /* still send the user to failed */
    }
    goFailed('Payment cancelled');
  }

  const verifying = status === 'verifying';
  const processing = status === 'loading' || verifying;
  const amount = order?.total;

  return (
    <CustomerShell title="Cart" showNav={false}>
      <div className="mx-auto flex max-w-[420px] flex-col items-center px-1 py-6 text-center md:max-w-[480px] md:pt-10">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-tertiary-fixed/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tertiary-fixed/70 shadow-inner">
              <Icon
                name={processing ? 'progress_activity' : 'payments'}
                size={28}
                className={`text-tertiary ${processing ? 'animate-spin' : ''}`}
              />
            </div>
          </div>
        </div>

        <h1 className="text-[22px] font-bold tracking-tight">
          {status === 'error'
            ? "Couldn't start payment"
            : verifying
              ? 'Verifying with the farm…'
              : status === 'loading'
                ? 'Connecting to bank…'
                : 'Confirm harvest payment'}
        </h1>
        <p className="mt-2 max-w-[300px] text-[14px] leading-relaxed text-on-surface-variant">
          {status === 'error'
            ? error || 'Check your connection and try again. The crate is still reserved.'
            : 'Waiting for verified farm payment. Tapping pay does not mark this order as paid.'}
        </p>

        {order ? (
          <Card className="mt-7 w-full text-left">
            <p className="ks-label text-outline">Amount due</p>
            <p className="mt-1 text-[28px] font-extrabold">{inr(amount)}</p>
            <p className="ks-caption mt-2 text-outline">
              {order.orderNumber}
              {checkout?.provider === 'dev' ? ' · Test payment (server-verified)' : checkout?.provider ? ` · ${checkout.provider}` : ''}
            </p>
          </Card>
        ) : null}

        {status === 'error' ? (
          <Button className="mt-8 w-full" onClick={startCheckout}>
            <Icon name="refresh" size={18} />
            Retry connection
          </Button>
        ) : (
          <>
            <Button className="mt-8 w-full" disabled={processing || status !== 'ready'} onClick={confirmDev}>
              {verifying ? 'Verifying…' : 'Complete verified payment'}
            </Button>
            <button
              type="button"
              className="mt-4 text-[14px] font-bold text-on-surface-variant disabled:opacity-50"
              disabled={verifying}
              onClick={cancel}
            >
              Cancel payment
            </button>
          </>
        )}
      </div>
    </CustomerShell>
  );
}

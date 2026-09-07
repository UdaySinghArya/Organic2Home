import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FarmerAuthShell from '../../components/farmer/FarmerAuthShell.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { farmerReturnPath, paths } from '../../lib/paths.js';
import { maskPhone } from '../../lib/phone.js';
import { clearPendingAuth, readPendingAuth } from '../../lib/pendingAuth.js';
import { authService } from '../../services/authService.js';

export default function FarmerOtpPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const pending = useMemo(() => readPendingAuth(), []);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(45);
  const [focused, setFocused] = useState(0);
  const inputs = useRef([]);

  useEffect(() => {
    if (!pending?.phone || pending.audience !== 'admin') navigate(paths.farmerLogin, { replace: true });
  }, [pending, navigate]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const otp = digits.join('');

  function setDigit(index, value) {
    const next = value.replace(/\D/g, '').slice(-1);
    const copy = [...digits];
    copy[index] = next;
    setDigits(copy);
    setError('');
    if (next && index < 5) inputs.current[index + 1]?.focus();
  }

  async function verify(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP (000000 until SMS is enabled)');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.verifyAdminOtp({ phone: pending.phone, otp });
      setSession(data.user, data.token);
      const next = farmerReturnPath(pending.from);
      navigate(next, { replace: true });
      clearPendingAuth();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (seconds > 0) return;
    try {
      await authService.resendAdminOtp({ phone: pending.phone });
      setSeconds(45);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  if (!pending?.phone || pending.audience !== 'admin') return null;

  return (
    <FarmerAuthShell
      title="Farmer login"
      subtitle={`Code sent to ${maskPhone(pending?.phone)}`}
      onBack={() => navigate(paths.farmerLogin)}
    >
      <form onSubmit={verify} className="rounded-[20px] bg-surface-lowest p-6 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-bold">Security code</p>
          <p className="flex items-center gap-1 text-[12px] font-medium text-on-surface-variant">
            <Icon name="sms" size={15} filled className="text-primary" />
            OTP sent via SMS
          </p>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              className={`h-14 w-full rounded-[16px] bg-surface-low text-center text-[18px] font-extrabold outline-none transition ${
                focused === index ? 'bg-surface-container ring-2 ring-primary' : ''
              }`}
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onFocus={() => setFocused(index)}
              onChange={(e) => setDigit(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
              }}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between px-1">
          <span className="ks-caption text-on-surface-variant">
            {seconds > 0 ? `Resend OTP in 0:${String(seconds).padStart(2, '0')}` : "Didn't receive code?"}
          </span>
          <button
            type="button"
            className={`text-[13px] font-bold text-secondary ${seconds > 0 ? 'opacity-40' : 'hover:underline'}`}
            onClick={resend}
          >
            Resend
          </button>
        </div>
        {error ? <p className="mt-3 text-[12px] font-medium text-secondary">{error}</p> : null}
        <Button type="submit" disabled={loading} className="mt-6 w-full">
          {loading ? 'Verifying…' : 'Verify & Enter'}
          <Icon name="arrow_forward" size={18} />
        </Button>
      </form>
    </FarmerAuthShell>
  );
}

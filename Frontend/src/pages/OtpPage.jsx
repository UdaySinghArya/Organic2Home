import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { customerReturnPath, paths } from '../lib/paths.js';
import { clearPendingAuth, readPendingAuth } from '../lib/pendingAuth.js';
import { digitsOnly, maskPhone } from '../lib/phone.js';
import { authService } from '../services/authService.js';

const EMPTY = ['', '', '', '', '', ''];

export default function OtpPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const pending = useMemo(() => readPendingAuth(), []);
  const [digits, setDigits] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(45);
  const [focused, setFocused] = useState(0);
  const inputs = useRef([]);

  useEffect(() => {
    if (!pending?.phone) navigate(paths.login, { replace: true });
  }, [pending, navigate]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const otp = digits.join('');
  const masked = maskPhone(pending?.phone);

  function fill(nextDigits) {
    const copy = [...EMPTY];
    nextDigits.slice(0, 6).forEach((digit, index) => {
      copy[index] = digit;
    });
    setDigits(copy);
    setError('');
    const nextFocus = Math.min(nextDigits.length, 5);
    inputs.current[nextFocus]?.focus();
  }

  function setDigit(index, value) {
    const next = digitsOnly(value, 6);
    if (next.length > 1) {
      fill(next.split(''));
      return;
    }
    const copy = [...digits];
    copy[index] = next.slice(-1);
    setDigits(copy);
    setError('');
    if (next && index < 5) inputs.current[index + 1]?.focus();
  }

  function onKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function onPaste(event) {
    event.preventDefault();
    fill(digitsOnly(event.clipboardData.getData('text'), 6).split(''));
  }

  async function verify(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit code sent to your phone');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.verifyCustomerOtp({
        phone: pending.phone,
        otp,
        mode: pending.mode,
        name: pending.name,
      });
      setSession(data.user, data.token);
      const next = customerReturnPath(pending.from);
      navigate(next, { replace: true });
      clearPendingAuth();
    } catch (err) {
      setError(err.message);
      setDigits(EMPTY);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (seconds > 0 || resending) return;
    setResending(true);
    try {
      await authService.resendCustomerOtp({ phone: pending.phone });
      setSeconds(45);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  if (!pending?.phone) return null;

  return (
    <AuthShell
      brand="direct"
      title="Verify OTP"
      subtitle={
        <>
          Code sent to <span className="font-semibold text-on-surface">{masked}</span>
        </>
      }
      onBack={() => navigate(pending.mode === 'register' ? paths.register : paths.login)}
    >
      <form onSubmit={verify} className="rounded-[20px] bg-surface-lowest p-6 shadow-card">
        <p className="mb-4 text-[13px] font-bold text-on-surface-variant">Enter 6-digit code</p>
        <div className="flex justify-between gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              className={`h-14 w-12 rounded-2xl bg-surface-low text-center text-[24px] font-extrabold outline-none ${
                focused === index ? 'bg-surface-lowest ring-2 ring-primary' : ''
              }`}
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              aria-label={`Digit ${index + 1}`}
              onFocus={() => setFocused(index)}
              onChange={(e) => setDigit(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e)}
              onPaste={onPaste}
            />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="ks-caption text-on-surface-variant">
            {seconds > 0 ? `Didn't receive code? 0:${String(seconds).padStart(2, '0')}` : "Didn't receive code?"}
          </span>
          <button
            type="button"
            disabled={seconds > 0 || resending}
            className={`text-[13px] font-bold text-primary ${seconds > 0 || resending ? 'opacity-40' : ''}`}
            onClick={resend}
          >
            {resending ? 'Sending…' : 'Resend OTP'}
          </button>
        </div>
        {error ? <p className="mt-3 text-[12px] font-medium text-secondary">{error}</p> : null}
        <Button type="submit" disabled={loading || otp.length !== 6} className="mt-6 w-full">
          {loading ? (
            <>
              <Icon name="progress_activity" size={18} className="animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              Verify & Proceed
              <Icon name="arrow_forward" size={18} />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

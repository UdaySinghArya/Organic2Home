import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell, { PhoneField } from '../components/auth/AuthShell.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { BRAND_NAME } from '../lib/brand.js';
import { customerReturnPath, paths } from '../lib/paths.js';
import { savePendingAuth } from '../lib/pendingAuth.js';
import { isValidPhone } from '../lib/phone.js';
import { authService } from '../services/authService.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const phoneHint =
    phone && !isValidPhone(phone) ? 'Please enter a valid 10-digit mobile number' : '';

  async function submit(e) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.requestCustomerOtp({ phone, mode: 'login' });
      savePendingAuth({ phone, mode: 'login', from: customerReturnPath(location.state?.from) });
      navigate(paths.otp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Enter your phone number to manage tomorrow's harvest delivery"
      onBack={() => navigate(paths.welcome)}
    >
      <form onSubmit={submit} className="rounded-[20px] bg-surface-lowest p-6 shadow-card">
        <PhoneField
          value={phone}
          onChange={(value) => {
            setPhone(value);
            setError('');
          }}
          error={error || phoneHint}
        />
        <Button type="submit" disabled={loading} className="mt-6 w-full">
          {loading ? (
            <>
              <Icon name="progress_activity" size={20} className="animate-spin" />
              Connecting to Harvest...
            </>
          ) : (
            <>
              Send OTP
              <Icon name="arrow_forward" size={20} />
            </>
          )}
        </Button>
        <p className="mt-4 text-center text-[14px] text-on-surface-variant">
          New to {BRAND_NAME}?
          <Link to={paths.register} className="ml-1 font-bold text-primary">
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

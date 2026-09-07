import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell, { PhoneField } from '../components/auth/AuthShell.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { customerReturnPath, paths } from '../lib/paths.js';
import { savePendingAuth } from '../lib/pendingAuth.js';
import { isValidPhone } from '../lib/phone.js';
import { authService } from '../services/authService.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required to create an account');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.requestCustomerOtp({ phone, name: name.trim(), mode: 'register' });
      savePendingAuth({
        phone,
        name: name.trim(),
        mode: 'register',
        from: customerReturnPath(location.state?.from),
      });
      navigate(paths.otp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create Account" onBack={() => navigate(paths.login)}>
      <form onSubmit={submit} className="flex flex-col gap-5 rounded-[20px] bg-surface-lowest p-6 shadow-card">
        <div>
          <label className="text-[15px] font-bold" htmlFor="full-name">
            Full Name
          </label>
          <div className="relative mt-2">
            <Icon name="person" size={20} className="absolute top-3.5 left-4 text-outline" />
            <input
              id="full-name"
              className="h-12 w-full rounded-full bg-surface-low pr-4 pl-11 outline-none focus:bg-surface-lowest"
              placeholder="e.g. Ramesh Sharma"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
            />
          </div>
        </div>
        <PhoneField
          variant="register"
          value={phone}
          onChange={(value) => {
            setPhone(value);
            setError('');
          }}
          error={phone && !isValidPhone(phone) ? 'Please enter a valid 10-digit mobile number' : ''}
        />
        <div className="flex items-center gap-2 rounded-2xl bg-surface-low p-3">
          <Icon name="schedule" size={18} className="text-primary" />
          <span className="text-[13px] font-bold">Tomorrow morning delivery, 7–10 AM</span>
        </div>
        {error ? <p className="text-[12px] font-medium text-secondary">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full" variant="harvest">
          {loading ? (
            <>
              <Icon name="sync" size={18} className="animate-spin" />
              Connecting to farm…
            </>
          ) : (
            <>
              Create account
              <Icon name="arrow_forward" size={18} />
            </>
          )}
        </Button>
      </form>
      <p className="mt-8 text-center text-[14px] text-on-surface-variant">
        Already have an account?
        <Link to={paths.login} className="ml-1 font-bold text-primary">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

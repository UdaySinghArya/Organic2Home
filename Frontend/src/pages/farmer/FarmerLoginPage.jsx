import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FarmerAuthShell from '../../components/farmer/FarmerAuthShell.jsx';
import { PhoneField } from '../../components/auth/AuthShell.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { farmerReturnPath, paths } from '../../lib/paths.js';
import { savePendingAuth } from '../../lib/pendingAuth.js';
import { isValidPhone } from '../../lib/phone.js';
import { authService } from '../../services/authService.js';

export default function FarmerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.requestAdminOtp({ phone });
      savePendingAuth({
        phone,
        mode: 'login',
        audience: 'admin',
        from: farmerReturnPath(location.state?.from),
      });
      navigate(paths.farmerOtp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FarmerAuthShell
      title="Admin login"
      subtitle="Enter your registered mobile number to manage tomorrow's harvest."
    >
      <form onSubmit={submit} className="rounded-[20px] bg-surface-lowest p-6 shadow-card">
        <PhoneField
          value={phone}
          onChange={(value) => {
            setPhone(value);
            setError('');
          }}
          error={error}
        />
        {error ? <p className="mt-2 text-[12px] font-medium text-secondary">{error}</p> : null}
        <Button type="submit" disabled={loading} className="mt-6 w-full">
          {loading ? 'Sending OTP…' : 'Send OTP'}
          <Icon name="arrow_forward" size={20} />
        </Button>
      </form>
    </FarmerAuthShell>
  );
}

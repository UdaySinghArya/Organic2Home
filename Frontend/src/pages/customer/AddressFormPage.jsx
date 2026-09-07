import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { validateAddress } from '../../lib/address.js';
import { digitsOnly } from '../../lib/phone.js';
import { paths } from '../../lib/paths.js';
import { customerService } from '../../services/customerService.js';

const LABELS = [
  { id: 'Home', icon: 'home' },
  { id: 'Work', icon: 'apartment' },
  { id: 'Family', icon: 'favorite' },
];

const empty = {
  name: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  label: 'Home',
  isDefault: true,
};

function Field({ label, error, children }) {
  return (
    <div className={`rounded-2xl bg-surface-low p-3 focus-within:bg-surface-container ${error ? 'ring-1 ring-secondary' : ''}`}>
      <label className="ks-label text-on-surface-variant">{label}</label>
      {children}
      {error ? <p className="mt-1 text-[12px] font-medium text-secondary">{error}</p> : null}
    </div>
  );
}

export default function AddressFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const fromCheckout = params.get('from') === 'checkout';
  const [form, setForm] = useState({
    ...empty,
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    customerService
      .getAddress(id)
      .then((data) => {
        if (!cancelled) setForm({ ...empty, ...data.address });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  function back() {
    if (fromCheckout) navigate(paths.checkout);
    else navigate(id ? paths.addresses : -1);
  }

  async function submit(e) {
    e.preventDefault();
    const nextErrors = validateAddress(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        name: form.name.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        landmark: form.landmark.trim(),
        label: form.label.trim() || 'Home',
      };
      if (id) await customerService.updateAddress(id, body);
      else await customerService.createAddress(body);
      back();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <CustomerShell title="Checkout Flow" showNav={false} onBack={back}>
      <form onSubmit={submit} className="mx-auto max-w-xl md:max-w-[720px]">
        <button
          type="button"
          className="mb-4 hidden items-center gap-2 text-[15px] font-bold text-primary md:inline-flex"
          onClick={back}
        >
          <Icon name="arrow_back" size={16} />
          {fromCheckout ? 'Back to Checkout' : 'Back'}
        </button>
        <span className="mb-2 hidden items-center gap-1.5 rounded-full bg-tertiary-fixed px-3 py-1 text-[11px] font-extrabold tracking-wider text-on-tertiary-fixed uppercase md:inline-flex">
          <Icon name="wb_sunny" size={14} filled />
          Next dawn route
        </span>
        <h1 className="ks-headline">{id ? 'Edit address' : 'Add delivery address'}</h1>
        <p className="mt-1 text-on-surface-variant">Orders arrive tomorrow morning, 7–10 AM directly from the farmer.</p>

        <Card className="mt-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-2xl bg-surface-low p-3 md:hidden">
            <Icon name="wb_sunny" size={20} filled className="text-primary" />
            <p className="text-[14px] font-medium text-on-surface-variant">
              For tomorrow morning's farm delivery, 7–10 AM
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" error={errors.name}>
            <input
              className="w-full bg-transparent text-[16px] font-medium outline-none"
              placeholder="e.g. full name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </Field>
          <Field label="Phone number" error={errors.phone}>
            <input
              className="w-full bg-transparent text-[16px] font-medium outline-none"
              inputMode="numeric"
              maxLength={10}
              placeholder="98765 43210"
              value={form.phone}
              onChange={(e) => set('phone', digitsOnly(e.target.value))}
            />
          </Field>
          </div>
          <Field label="House / Flat number, building" error={errors.addressLine1}>
            <input
              className="w-full bg-transparent text-[16px] font-medium outline-none"
              placeholder="e.g. Flat 302, Palm Grove"
              value={form.addressLine1}
              onChange={(e) => set('addressLine1', e.target.value)}
            />
          </Field>
          <Field label="Street / locality">
            <input
              className="w-full bg-transparent text-[16px] font-medium outline-none"
              placeholder="Optional"
              value={form.addressLine2}
              onChange={(e) => set('addressLine2', e.target.value)}
            />
          </Field>
          <Field label="Village / Area / City" error={errors.city}>
            <input
              className="w-full bg-transparent text-[16px] font-medium outline-none"
              placeholder="e.g. Badshahpur, Gurugram"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="State" error={errors.state}>
              <input
                className="w-full bg-transparent text-[16px] font-medium outline-none"
                placeholder="Haryana"
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
              />
            </Field>
            <Field label="Pincode" error={errors.pincode}>
              <input
                className="w-full bg-transparent text-[16px] font-medium outline-none"
                inputMode="numeric"
                maxLength={6}
                placeholder="122001"
                value={form.pincode}
                onChange={(e) => set('pincode', digitsOnly(e.target.value, 6))}
              />
            </Field>
          </div>
          <Field label="Landmark">
            <input
              className="w-full bg-transparent text-[16px] font-medium outline-none"
              placeholder="Near the old peepal tree"
              value={form.landmark}
              onChange={(e) => set('landmark', e.target.value)}
            />
          </Field>

          <div>
            <p className="ks-label mb-2 text-on-surface-variant">Label</p>
            <div className="flex flex-wrap gap-2">
              {(LABELS.some((item) => item.id === form.label)
                ? LABELS
                : [...LABELS, { id: form.label || 'Other', icon: 'place' }]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold ${
                    form.label === item.id ? 'bg-primary text-white' : 'bg-surface-low text-on-surface'
                  }`}
                  onClick={() => set('label', item.id)}
                >
                  <Icon name={item.icon} size={16} />
                  {item.id}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-[14px] font-bold">
            <input
              type="checkbox"
              checked={Boolean(form.isDefault)}
              onChange={(e) => set('isDefault', e.target.checked)}
            />
            Set as default address
          </label>

          <p className="flex items-start gap-1.5 text-[12px] text-on-surface-variant">
            <Icon name="location_on" size={16} className="mt-0.5 text-primary" />
            We currently deliver to all morning cluster zones within 35 km.
          </p>
        </Card>

        <div className="mt-4 hidden items-center justify-center gap-6 text-[12px] font-medium text-on-surface-variant md:flex">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="eco" size={16} className="text-primary" />
            Zero cold-storage holdover
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="lock" size={16} className="text-secondary" />
            Contactless morning crate
          </span>
        </div>

        {error ? <p className="mt-3 text-[12px] font-medium text-secondary">{error}</p> : null}
        <Button type="submit" variant="harvest" className="mt-6 w-full" disabled={saving || loading}>
          {saving ? 'Confirming route…' : 'Save address'}
        </Button>
      </form>
    </CustomerShell>
  );
}

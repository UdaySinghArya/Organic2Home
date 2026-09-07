import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FarmerShell from '../../components/layout/FarmerShell.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { produceImage } from '../../lib/produceImages.js';
import { CATEGORIES, UNITS } from '../../lib/farmerUi.js';
import { paths } from '../../lib/paths.js';
import { farmerService } from '../../services/farmerService.js';

const empty = {
  name: '',
  description: '',
  category: 'vegetables',
  price: '',
  unit: 'kg',
  image: '',
  stockQuantity: '',
  available: true,
};

export default function FarmerProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    farmerService
      .getProduct(id)
      .then((data) => {
        const product = data.product;
        setForm({
          name: product.name || '',
          description: product.description || '',
          category: product.category || 'vegetables',
          price: String(product.price ?? ''),
          unit: product.unit || 'kg',
          image: product.image || '',
          stockQuantity: String(product.stockQuantity ?? ''),
          available: product.status === 'ACTIVE' && product.availability !== false,
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const preview = form.image || produceImage({ name: form.name });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const image = form.image.trim() || produceImage({ name: form.name });
      if (!image) {
        setError('Add a produce photo URL');
        setSaving(false);
        return;
      }
      const body = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        unit: form.unit,
        image,
        stockQuantity: Number(form.stockQuantity),
        availability: form.available,
        status: form.available ? 'ACTIVE' : 'RESTING',
      };
      if (id) await farmerService.updateProduct(id, body);
      else await farmerService.createProduct(body);
      navigate(paths.farmerProducts);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <FarmerShell onBack={() => navigate(paths.farmerProducts)} headerTitle={id ? 'Edit product' : 'Add Harvest Log'} showNav={false}>
      <div className="mx-auto max-w-[540px]">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-[11px] font-extrabold tracking-wider text-on-surface-variant uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Direct from Mandi & Farm
          </span>
          <span className="text-[12px] text-on-surface-variant">Step 1 of 1</span>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-5 rounded-[20px] bg-surface-lowest p-5 shadow-card">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[13px] font-bold">Produce Visual</label>
              <span className="text-[12px] text-primary">Recommended 1:1</span>
            </div>
            <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-[16px] bg-surface-low">
              {preview ? (
                <>
                  <img alt={form.name || 'Produce preview'} src={preview} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/50 via-transparent to-transparent" />
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-primary">
                    <Icon name="photo_camera" size={28} />
                  </div>
                  <p className="text-[17px] font-semibold">Add a produce photo URL</p>
                  <p className="text-[12px] text-on-surface-variant">Clear photos attract more morning buyers</p>
                </div>
              )}
            </div>
            <input
              className="mt-3 h-12 w-full rounded-full bg-surface-low px-5 text-[14px] outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://…"
              value={form.image}
              onChange={(e) => set('image', e.target.value)}
            />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[13px] font-bold">Product Name</span>
            <input
              className="h-12 rounded-full bg-surface-low px-5 text-[16px] outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Desi Vine Tomato"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </label>

          <div>
            <p className="mb-1 text-[13px] font-bold">Category</p>
            <div className="flex gap-2">
              {CATEGORIES.map((category) => {
                const active = form.category === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13px] font-bold ${
                      active ? 'bg-primary text-white shadow-sm' : 'bg-surface-low text-on-surface'
                    }`}
                    onClick={() => set('category', category.id)}
                  >
                    <Icon name={category.icon} size={18} />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[13px] font-bold">Price per unit</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[17px] font-bold">₹</span>
                <input
                  className="h-12 w-full rounded-full bg-surface-low pl-9 pr-4 text-[18px] font-extrabold outline-none focus:ring-2 focus:ring-primary"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  required
                />
              </div>
            </label>
            <div>
              <p className="mb-1 text-[13px] font-bold">Unit of Measure</p>
              <div className="flex h-[52px] items-center gap-1.5 rounded-full bg-surface-low p-1">
                {UNITS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    className={`h-full flex-1 rounded-full text-[13px] font-bold ${
                      form.unit === unit ? 'bg-primary text-white shadow-sm' : 'text-on-surface hover:text-primary'
                    }`}
                    onClick={() => set('unit', unit)}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[13px] font-bold">Stock on hand</span>
            <input
              className="h-12 rounded-full bg-surface-low px-5 text-[16px] outline-none focus:ring-2 focus:ring-primary"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => set('stockQuantity', e.target.value)}
              required
            />
          </label>

          <div className="flex items-center gap-3 rounded-[16px] bg-surface-low p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
              <Icon name="wb_twilight" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 text-[11px] font-extrabold text-on-tertiary-fixed">
                  Kal Aayega
                </span>
                <span className="text-[11px] font-extrabold text-on-surface-variant">Morning Delivery</span>
              </div>
              <p className="mt-0.5 text-[12px] text-on-surface-variant">Harvested at sunset, packed for dawn drop.</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[16px] bg-surface-low p-3">
            <div className="flex items-center gap-3 pr-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name="agriculture" size={20} />
              </div>
              <div>
                <p className="text-[13px] font-bold">Available for tomorrow's harvest</p>
                <p className="text-[12px] text-on-surface-variant">Shows live on the early dawn store</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.available}
              className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition ${form.available ? 'bg-primary' : 'bg-surface-container'}`}
              onClick={() => set('available', !form.available)}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transition ${
                  form.available ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {error ? <p className="text-[12px] font-medium text-secondary">{error}</p> : null}

          <Button type="submit" variant="harvest" className="h-14 w-full" disabled={saving}>
            <Icon name="check_circle" size={22} />
            {saving ? 'Saving…' : 'Save product'}
          </Button>
          <button
            type="button"
            className="text-[13px] font-bold text-on-surface-variant"
            onClick={() => navigate(paths.farmerProducts)}
          >
            Cancel
          </button>
        </form>
      </div>
    </FarmerShell>
  );
}

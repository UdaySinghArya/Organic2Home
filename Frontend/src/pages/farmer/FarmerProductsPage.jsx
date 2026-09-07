import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FarmerShell from '../../components/layout/FarmerShell.jsx';
import FarmerProductCard from '../../components/farmer/FarmerProductCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { paths } from '../../lib/paths.js';
import { farmerService } from '../../services/farmerService.js';

export default function FarmerProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await farmerService.listProducts();
      setProducts(data.products || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(product) {
    const active = product.status === 'ACTIVE' && product.availability !== false;
    const next = active ? 'RESTING' : 'ACTIVE';
    setBusyId(product.id);
    try {
      await farmerService.patchProductStatus(product.id, { status: next });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  }

  const activeCount = products.filter((product) => product.status === 'ACTIVE' && product.availability !== false).length;

  return (
    <FarmerShell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="ks-headline tracking-tight">Products</h1>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-on-surface-variant">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
            {products.length
              ? `${activeCount} of ${products.length} picking for dawn dispatch`
              : 'Add produce for tomorrow’s harvest'}
          </p>
        </div>
        <Button className="min-h-11 shrink-0 px-4 text-[13px]" onClick={() => navigate(paths.farmerProductNew)}>
          <Icon name="add" size={20} />
          Add product
        </Button>
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-[20px] bg-surface-low p-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
          <Icon name="wb_sunny" size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold">Dawn Harvest Commitment</p>
          <p className="truncate text-[12px] text-on-surface-variant">
            Crops toggled active will be cut fresh after 5 PM sunset.
          </p>
        </div>
      </div>

      {loading ? <LoadingState label="Loading products…" /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && products.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="No products listed"
          body="Add produce with a real price, unit and stock. The storefront will use this data."
          actionLabel="Add product"
          onAction={() => navigate(paths.farmerProductNew)}
        />
      ) : null}

      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
        {products.map((product) => (
          <FarmerProductCard key={product.id} product={product} busy={busyId === product.id} onToggle={toggle} />
        ))}
      </div>
    </FarmerShell>
  );
}

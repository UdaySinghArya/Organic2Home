import { useEffect, useMemo, useState } from 'react';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import Banner from '../../components/ui/Banner.jsx';
import Chip from '../../components/ui/Chip.jsx';
import Icon from '../../components/ui/Icon.jsx';
import ProductCard from '../../components/ui/ProductCard.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useCart } from '../../cart/CartContext.jsx';
import { firstName } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { customerService } from '../../services/customerService.js';

const FALLBACK_CATEGORIES = [
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'fruits', name: 'Fruits' },
];

export default function HomePage() {
  const { user } = useAuth();
  const { quantityFor, add, setQuantity } = useCart();
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [category, setCategory] = useState('vegetables');
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [catData, prodData] = await Promise.all([
        customerService.listCategories(),
        customerService.listProducts(),
      ]);
      const nextCategories = catData.categories?.length ? catData.categories : FALLBACK_CATEGORIES;
      setCategories(nextCategories);
      setCategory((current) =>
        nextCategories.some((item) => item.id === current) ? current : nextCategories[0].id,
      );
      setProducts(prodData.products || []);
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((item) => {
      const haystack = `${item.name} ${item.description || ''}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesCategory = q ? true : item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  const vegetablesId = categories.find((item) => item.id === 'vegetables')?.id || categories[0]?.id;

  function emptyTitle() {
    const q = query.trim();
    if (!q) return 'No produce in this batch';
    if (q.toLowerCase().includes('mango')) return 'No mango today. Try vegetables.';
    return `No ${q} today. Try fresh vegetables.`;
  }

  async function onAdd(product) {
    setBusyId(product.id);
    try {
      await add(product.id, 1);
      setActionError('');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId('');
    }
  }

  async function onQuantity(product, qty) {
    setBusyId(product.id);
    try {
      await setQuantity(product.id, qty);
      setActionError('');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId('');
    }
  }

  function selectCategory(id) {
    setCategory(id);
    setQuery('');
  }

  return (
    <CustomerShell greeting={`Namaste, ${firstName(user?.name)}`} showBasket>
      <Banner
        title="Aaj book karo · Kal 7–10 AM"
        subtitle="Order before 8:00 PM • Morning Delivery 7–10 AM"
        badge="8:00 PM cutoff"
      />

      <div className="relative mt-4 flex items-center">
        <Icon name="search" size={20} className="pointer-events-none absolute left-4 text-outline" />
        <input
          className="h-12 w-full rounded-full bg-surface-lowest pr-12 pl-12 text-[15px] shadow-sm outline-none placeholder:text-outline focus:ring-2 focus:ring-primary"
          placeholder="Search tomato, mango…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-on-surface-variant"
            onClick={() => setQuery('')}
          >
            <Icon name="close" size={16} />
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Chip key={item.id} active={category === item.id} onClick={() => selectCategory(item.id)}>
              {item.name}
            </Chip>
          ))}
        </div>
        <p className="ks-label shrink-0 text-outline">
          {visible.length} {visible.length === 1 ? 'item' : 'items'} ready
        </p>
      </div>

      {actionError ? <p className="mt-3 text-[12px] font-medium text-secondary">{actionError}</p> : null}

      {loading ? <LoadingState /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && visible.length === 0 ? (
        <EmptyState
          icon="potted_plant"
          title={emptyTitle()}
          body="Our morning harvest rotates based on seasonal field freshness and soil moisture."
          actionLabel="Show all fresh vegetables"
          onAction={() => selectCategory(vegetablesId)}
        />
      ) : null}

      {!loading && !error && visible.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              unit={product.unit}
              image={product.image}
              inStock={product.inStock}
              quantity={quantityFor(product.id)}
              to={paths.product(product.id)}
              onAdd={() => !busyId && onAdd(product)}
              onQuantityChange={(qty) => onQuantity(product, qty)}
            />
          ))}
        </div>
      ) : null}
    </CustomerShell>
  );
}

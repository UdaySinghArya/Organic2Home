export function isPurchasable(product) {
  if (!product) return false;
  return (
    product.status === 'ACTIVE' &&
    product.availability !== false &&
    Number(product.stockQuantity || 0) > 0
  );
}

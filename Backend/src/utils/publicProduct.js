export function publicProduct(product, { farmerView = false } = {}) {
  const stockQuantity = Number(product.stockQuantity || 0);
  const status = product.status;
  const inStock = status === 'ACTIVE' && product.availability !== false && stockQuantity > 0;

  return {
    id: String(product._id),
    name: product.name,
    description: product.description || null,
    category: product.category,
    price: product.price,
    unit: product.unit,
    image: product.image,
    stockQuantity: farmerView ? stockQuantity : stockQuantity,
    availability: Boolean(product.availability),
    status,
    inStock,
    farm: product.farm || null,
    farmerId: product.farmerId ? String(product.farmerId) : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

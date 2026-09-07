import { Product, PRODUCT_CATEGORIES } from '../models/Product.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { publicProduct } from '../utils/publicProduct.js';
import { assertProductId } from '../utils/validateProduct.js';

export async function listCustomerProducts(req, res, next) {
  try {
    const category = String(req.query.category || '').trim().toLowerCase();
    const filter = { status: { $ne: 'RESTING' } };

    if (category) {
      if (!PRODUCT_CATEGORIES.includes(category)) {
        throw createHttpError(400, 'Category must be vegetables or fruits', 'INVALID_CATEGORY');
      }
      filter.category = category;
    }

    if (req.query.availability === 'true') {
      filter.availability = true;
      filter.status = 'ACTIVE';
      filter.stockQuantity = { $gt: 0 };
    } else if (req.query.availability === 'false') {
      filter.$or = [{ availability: false }, { status: 'OUT_OF_STOCK' }, { stockQuantity: 0 }];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        products: products.map((item) => publicProduct(item)),
        count: products.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerProduct(req, res, next) {
  try {
    assertProductId(req.params.id);
    const product = await Product.findOne({ _id: req.params.id, status: { $ne: 'RESTING' } });
    if (!product) {
      throw createHttpError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }
    res.json({
      success: true,
      data: { product: publicProduct(product) },
    });
  } catch (err) {
    next(err);
  }
}

export async function listCategories(_req, res) {
  res.json({
    success: true,
    data: {
      categories: PRODUCT_CATEGORIES.map((id) => ({
        id,
        name: id === 'vegetables' ? 'Vegetables' : 'Fruits',
      })),
    },
  });
}

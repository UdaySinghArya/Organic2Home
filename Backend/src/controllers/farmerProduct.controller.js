import { Product } from '../models/Product.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { publicProduct } from '../utils/publicProduct.js';
import { assertProductId, readProductInput, syncStockStatus } from '../utils/validateProduct.js';

async function findOwnedProduct(adminId, id) {
  assertProductId(id);
  const product = await Product.findOne({ _id: id, farmerId: adminId });
  if (!product) {
    throw createHttpError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
  }
  return product;
}

function farmFromAdmin(admin) {
  return {
    name: admin.farmProfile?.farmName,
    field: admin.farmProfile?.plot,
    location: admin.farmProfile?.village || admin.farmProfile?.location,
  };
}

export async function listFarmerProducts(req, res, next) {
  try {
    const products = await Product.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        products: products.map((item) => publicProduct(item, { farmerView: true })),
        count: products.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createFarmerProduct(req, res, next) {
  try {
    const input = syncStockStatus(readProductInput(req.body));
    if (!input.farm) {
      input.farm = farmFromAdmin(req.user);
    }

    const product = await Product.create({
      ...input,
      farmerId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: { product: publicProduct(product, { farmerView: true }) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getFarmerProduct(req, res, next) {
  try {
    const product = await findOwnedProduct(req.user._id, req.params.id);
    res.json({
      success: true,
      data: { product: publicProduct(product, { farmerView: true }) },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateFarmerProduct(req, res, next) {
  try {
    const product = await findOwnedProduct(req.user._id, req.params.id);
    const input = syncStockStatus(readProductInput(req.body, { partial: true }), product);
    Object.assign(product, input);
    await product.save();

    res.json({
      success: true,
      data: { product: publicProduct(product, { farmerView: true }) },
    });
  } catch (err) {
    next(err);
  }
}

export async function patchFarmerProductStatus(req, res, next) {
  try {
    const product = await findOwnedProduct(req.user._id, req.params.id);
    const input = syncStockStatus(readProductInput({ status: req.body.status }, { partial: true }), product);

    if (input.status === 'ACTIVE' && product.stockQuantity <= 0) {
      throw createHttpError(400, 'Cannot activate a product with zero stock', 'INVALID_STATUS');
    }

    product.status = input.status;
    if (input.status === 'OUT_OF_STOCK') product.availability = false;
    if (input.status === 'ACTIVE') product.availability = true;
    await product.save();

    res.json({
      success: true,
      data: { product: publicProduct(product, { farmerView: true }) },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteFarmerProduct(req, res, next) {
  try {
    const product = await findOwnedProduct(req.user._id, req.params.id);
    await product.deleteOne();
    res.json({
      success: true,
      data: { deleted: true, id: String(product._id) },
    });
  } catch (err) {
    next(err);
  }
}

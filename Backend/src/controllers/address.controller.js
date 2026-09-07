import { Address } from '../models/Address.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { publicAddress } from '../utils/public.js';
import { assertObjectId, readAddressInput } from '../utils/validateAddress.js';

async function setDefaultExclusive(userId, addressId) {
  await Address.updateMany({ userId, _id: { $ne: addressId } }, { $set: { isDefault: false } });
  await Address.updateOne({ _id: addressId, userId }, { $set: { isDefault: true } });
}

async function findOwnedAddress(userId, id) {
  assertObjectId(id);
  const address = await Address.findOne({ _id: id, userId });
  if (!address) {
    throw createHttpError(404, 'Address not found', 'ADDRESS_NOT_FOUND');
  }
  return address;
}

export async function listAddresses(req, res, next) {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({
      success: true,
      data: {
        addresses: addresses.map(publicAddress),
        defaultAddress: addresses.find((item) => item.isDefault)
          ? publicAddress(addresses.find((item) => item.isDefault))
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req, res, next) {
  try {
    const input = readAddressInput(req.body);
    const count = await Address.countDocuments({ userId: req.user._id });
    const isDefault = count === 0 ? true : Boolean(input.isDefault);

    const address = await Address.create({
      ...input,
      userId: req.user._id,
      isDefault,
    });

    if (address.isDefault) {
      await setDefaultExclusive(req.user._id, address._id);
      address.isDefault = true;
    }

    res.status(201).json({
      success: true,
      data: { address: publicAddress(address) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAddress(req, res, next) {
  try {
    const address = await findOwnedAddress(req.user._id, req.params.id);
    res.json({
      success: true,
      data: { address: publicAddress(address) },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const address = await findOwnedAddress(req.user._id, req.params.id);
    const input = readAddressInput(req.body, { partial: true });

    Object.assign(address, input);

    if (input.isDefault === true) {
      address.isDefault = true;
    } else if (input.isDefault === false && address.isDefault) {
      const others = await Address.countDocuments({
        userId: req.user._id,
        _id: { $ne: address._id },
      });
      if (others === 0) {
        throw createHttpError(400, 'At least one default address is required', 'DEFAULT_REQUIRED');
      }
      address.isDefault = false;
    }

    await address.save();

    if (address.isDefault) {
      await setDefaultExclusive(req.user._id, address._id);
    } else {
      const hasDefault = await Address.exists({ userId: req.user._id, isDefault: true });
      if (!hasDefault) {
        const nextDefault = await Address.findOne({ userId: req.user._id, _id: { $ne: address._id } }).sort({
          updatedAt: -1,
        });
        if (nextDefault) {
          nextDefault.isDefault = true;
          await nextDefault.save();
        }
      }
    }

    const fresh = await Address.findById(address._id);
    res.json({
      success: true,
      data: { address: publicAddress(fresh) },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const address = await findOwnedAddress(req.user._id, req.params.id);
    const wasDefault = address.isDefault;
    await address.deleteOne();

    if (wasDefault) {
      const nextDefault = await Address.findOne({ userId: req.user._id }).sort({ updatedAt: -1 });
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    res.json({
      success: true,
      data: { deleted: true, id: String(address._id) },
    });
  } catch (err) {
    next(err);
  }
}

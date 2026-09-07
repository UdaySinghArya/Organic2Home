import crypto from 'crypto';
import { env } from '../config/env.js';
import { PaymentProvider } from './PaymentProvider.js';

function sign(parts) {
  return crypto.createHmac('sha256', env.jwtSecret).update(parts.join('|')).digest('hex');
}

export class DevPaymentProvider extends PaymentProvider {
  get name() {
    return 'dev';
  }

  async createPayment(order) {
    const providerOrderId = `order_dev_${order._id}`;
    return {
      provider: this.name,
      providerOrderId,
      amount: order.total,
      currency: 'INR',
      keyId: null,
    };
  }

  verifySignature({ providerOrderId, referenceId, signature, amount }) {
    const expected = sign([providerOrderId, referenceId, String(amount)]);
    return Boolean(signature) && crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(String(signature)),
    );
  }

  signPayload(providerOrderId, referenceId, amount) {
    return sign([providerOrderId, referenceId, String(amount)]);
  }

  parseWebhook(headers, body) {
    const signature =
      headers['x-organic2home-signature'] || headers['x-khetse-signature'] || headers['x-payment-signature'];
    return {
      event: body.event || 'payment.captured',
      providerOrderId: body.providerOrderId,
      referenceId: body.referenceId,
      amount: body.amount,
      status: body.status,
      signature,
    };
  }
}

import crypto from 'crypto';
import { PaymentProvider } from './PaymentProvider.js';

export class RazorpayPaymentProvider extends PaymentProvider {
  get name() {
    return 'razorpay';
  }

  async createPayment(order) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Enable when Razorpay keys are set:
    // const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    // const res = await fetch('https://api.razorpay.com/v1/orders', {
    //   method: 'POST',
    //   headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     amount: Math.round(order.total * 100),
    //     currency: 'INR',
    //     receipt: order.orderNumber,
    //   }),
    // });
    // const json = await res.json();
    // return { provider: this.name, providerOrderId: json.id, amount: order.total, currency: 'INR', keyId };

    if (!keyId || !keySecret) {
      throw new Error('Razorpay keys are not configured');
    }

    return {
      provider: this.name,
      providerOrderId: `order_rzp_${order._id}`,
      amount: order.total,
      currency: 'INR',
      keyId,
    };
  }

  verifySignature({ providerOrderId, referenceId, signature }) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || !signature) return false;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${providerOrderId}|${referenceId}`)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  parseWebhook(headers, body) {
    return {
      event: body.event,
      providerOrderId: body.payload?.payment?.entity?.order_id,
      referenceId: body.payload?.payment?.entity?.id,
      amount: body.payload?.payment?.entity?.amount
        ? body.payload.payment.entity.amount / 100
        : undefined,
      status: body.event === 'payment.captured' ? 'SUCCESS' : 'FAILED',
      signature: headers['x-razorpay-signature'],
    };
  }
}

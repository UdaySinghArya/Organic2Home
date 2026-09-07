import { DevPaymentProvider } from './DevPaymentProvider.js';
import { RazorpayPaymentProvider } from './RazorpayPaymentProvider.js';

const devProvider = new DevPaymentProvider();
const razorpayProvider = new RazorpayPaymentProvider();

export function getPaymentProvider() {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return razorpayProvider;
  }
  return devProvider;
}

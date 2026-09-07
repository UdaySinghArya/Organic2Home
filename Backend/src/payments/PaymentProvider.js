export class PaymentProvider {
  get name() {
    return 'base';
  }

  async createPayment(_order) {
    throw new Error('createPayment not implemented');
  }

  verifySignature(_payload) {
    throw new Error('verifySignature not implemented');
  }

  parseWebhook(_headers, _body) {
    throw new Error('parseWebhook not implemented');
  }
}

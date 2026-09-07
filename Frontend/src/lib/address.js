import { isValidPhone } from './phone.js';

const PINCODE_RE = /^\d{6}$/;

export function validateAddress(form) {
  const errors = {};
  if (!String(form.name || '').trim()) errors.name = 'Full name is required';
  if (!isValidPhone(form.phone)) errors.phone = 'Please enter a valid 10-digit mobile number';
  if (!String(form.addressLine1 || '').trim()) errors.addressLine1 = 'House / flat / building is required';
  if (!String(form.city || '').trim()) errors.city = 'Village / area / city is required';
  if (!String(form.state || '').trim()) errors.state = 'State is required';
  if (!PINCODE_RE.test(String(form.pincode || ''))) errors.pincode = 'Please enter a valid 6-digit pincode';
  return errors;
}

export function addressHeadline(address) {
  if (!address) return '';
  const line = [address.addressLine1, address.city].filter(Boolean).join(', ');
  return `${address.label || 'Home'} · ${line}`;
}

export const PHONE_RE = /^[6-9]\d{9}$/;

export function digitsOnly(value, max = 10) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, max);
}

export function isValidPhone(phone) {
  return PHONE_RE.test(phone);
}

export function maskPhone(phone) {
  if (!phone || phone.length < 4) return '';
  return `+91 ${phone.slice(0, 2)}XXXXXX${phone.slice(-2)}`;
}

export function formatDisplayPhone(phone) {
  const d = digitsOnly(phone);
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  return d ? `+91 ${d}` : '';
}

export function nameInitial(name) {
  const letter = String(name || '').trim().charAt(0);
  return letter ? letter.toUpperCase() : 'K';
}

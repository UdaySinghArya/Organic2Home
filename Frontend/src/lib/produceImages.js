/** Stitch produce photos — visual assets only, never catalog truth. */
export const STITCH_PRODUCE = {
  tomato:
    'https://lh3.googleusercontent.com/aida/AEtjO1USsJTs1mJDwTx06vyz7U90E3LfosMgosLpCQPB36R0QKgfS3eNLy8XVCE9nu_UnkPSR9T7MkR7Bcs7JkIV-5a28NW8A47uC-rbtrT7uj70NSjmhrkT9Sii_he0BINH4qW9aBkBfIXP6-nM7eNv98UEkwwH8pf65uVRJE6upGkjKbNHrGdsYh0fily0dcmRjzfRj13k-Rsqzczd5pw-gI9s_pCClYFLkXAQc4GOBKym-eCIxZAe42IG82sv',
  potato:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD5xCZPurUlij-sUY6QtGHCd_86gGwqCFoTvfCuLyz1aamQziViEQKKijw8GX1jgU6otG-iTMYEhHpwx6DKnd_A5bssd6-3sJSWaDA_fSO9hrgpykuzkwUbHui7tEZediDlwNZRptKbq8HxLpoEL7NWgX-N-DtNmvBSAc0r4eXisAmu0T4uGo-elcEWeFpf0eEXm-M-5whuSNUd718EQBSiYYxvU9TD25u6Rn8u926F7ch2sH1qN7QV9w',
  palak:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAtfa69llPJ8fj-U8rfQeYAs7aXNzV2canpZv7LuxRxLgj2YEt15DfIaBLJEtFR9oRINS7CL2S9ypgHzz6d3fttgvnqT5vYdYO_Jls6XwEAJw-jbAbdGxVI-n_MAYR3fBXEcafAHWCktc5nG2ADaha0QJjk0sdVELHPcIDA7NJ69qhqac3Ek5gQJEkvgw3VltufTzCtaM9sQ42444_TXZdQEIwuf73XEELyX9rH4hAMeFuyeh4JMDwKVA',
  onion:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCBMgDst9tXn3veuicPUli9soJX4GtrBHlVU0UVL7130H5ghT2803WqVl5AuNasAwxTOgLF7YKYstCZubCxHiMMDcA3FPRhGlu_PpTiMuvqKFo8jEnXTePP-U40Qvqlm5P5zSiTqq9GRwBmh1UTQrVdNlL0zAYAaCc4KExrt4u3G9wLBHe9oHlEs5oz3HP2lceXCWilS5ySGd5ZSKIE3MutfOHfW5JwkvyBoH1OWYRBoQuHwE4w7zv3rQ',
  mango:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuByU51zHsbTmBLLXXUBKTAqP0Ju7oPgFhZDu7G0VFx1DDyN1NWlfPDlX13Xjzj_urZpCDr8YyJc-kHkSCQ-3pzjTZFmK3qeRzKq6XKvYaU19FKU8FZ-nLYKoEWpD5qVfxqacKO27FzjizLA4j8AoQYHCJLe_paboFHKxeGDu08vIeefpBiCSFjVvZ-dbr_DTmTSvYg7veH8_ZAleyjudvS1leIrL0rXiawCRTeQsu3NYwFDwEgk61rPjA',
};

export function produceImage(product) {
  if (product?.image) return product.image;
  const name = String(product?.name || '').toLowerCase();
  if (name.includes('tomato')) return STITCH_PRODUCE.tomato;
  if (name.includes('potato')) return STITCH_PRODUCE.potato;
  if (name.includes('palak') || name.includes('spinach')) return STITCH_PRODUCE.palak;
  if (name.includes('onion')) return STITCH_PRODUCE.onion;
  if (name.includes('mango')) return STITCH_PRODUCE.mango;
  return '';
}

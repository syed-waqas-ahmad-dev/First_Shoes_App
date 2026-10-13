/**
 * @file lib/constants.ts
 * @description Enterprise constants and configuration for OX Shoes Pakistan.
 * Strict TypeScript: ZERO `any`.
 */

export const APP_NAME = 'OX Shoes';
export const APP_DESCRIPTION = 'Enterprise Handcrafted Footwear & Sneakers for Pakistan';
export const CURRENCY_CODE = 'PKR';
export const GST_RATE = 0.17; // 17% Pakistani General Sales Tax
export const FREE_SHIPPING_THRESHOLD = 3500; // Free shipping in PKR
export const COD_MAX_LIMIT_WITHOUT_OTP = 10000; // Require OTP verification for COD > PKR 10,000

export const NAV_LINKS = [
  { label: 'Men', labelUr: 'مردانہ', href: '/shop?category=Men' },
  { label: 'Women', labelUr: 'زنانہ', href: '/shop?category=Women' },
  { label: 'Kids', labelUr: 'بچوں کے', href: '/shop?category=Kids' },
  { label: 'Stores', labelUr: 'اسٹورز', href: '/stores' },
  { label: 'Track', labelUr: 'ٹریکنگ', href: '/track' },
  { label: 'Sale', labelUr: 'سیل', href: '/shop?onSale=true', highlight: true },
];

export const PAKISTAN_MAJOR_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Quetta',
  'Multan',
  'Faisalabad',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Sukkur',
  'Mardan',
  'Kasur',
  'Sheikhupura',
  'Gujrat',
  'Sahiwal',
];

export const PAYMENT_METHOD_DETAILS = {
  COD: {
    label: 'Cash on Delivery (COD)',
    labelUr: 'کیش آن ڈیلیوری',
    desc: 'Pay in cash when courier delivers to your doorstep. Available nationwide.',
    badge: 'Most Popular',
  },
  JazzCash: {
    label: 'JazzCash Mobile Account / Voucher',
    labelUr: 'جاز کیش',
    desc: 'Instant payment via JazzCash mobile wallet or 03XX account.',
    badge: 'Instant',
  },
  Easypaisa: {
    label: 'Easypaisa Mobile Wallet',
    labelUr: 'ایزی پیسہ',
    desc: 'Pay directly using your Easypaisa mobile balance or debit card.',
    badge: 'Instant',
  },
  BankTransfer: {
    label: 'Direct Bank Transfer (IBFT)',
    labelUr: 'بینک ٹرانسفر',
    desc: 'Meezan Bank / HBL instant transfer with receipt upload.',
    badge: 'Secure',
  },
  Card: {
    label: 'Debit / Credit Card (Visa & Mastercard)',
    labelUr: 'بینک کارڈ',
    desc: 'Encrypted online transaction with 3D Secure OTP.',
    badge: '100% Safe',
  },
} as const;

export const BUSINESS_NAME = 'Press On Nails By Tara';
export const WHATSAPP_NUMBER = '918982435066';
export const INSTAGRAM_HANDLE = '@pressonnailsbytara';
export const INSTAGRAM_URL = 'https://www.instagram.com/pressonnailsbytara?igsh=NzR4bzJoaTh1dGtn';

export const SHAPES = ['Round', 'Square', 'Oval', 'Almond', 'Coffin', 'Stiletto'];
export const LENGTHS = ['Short', 'Medium', 'Long', 'Extra Long'];
export const FINISHES = ['Glossy', 'Matte', 'Satin', 'Chrome', 'Glitter', 'Holographic'];
export const TAGS = ['bestseller', 'new', 'bridal', 'everyday', 'festive', 'minimal', 'bold'];
export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

export const SHIPPING_THRESHOLD = 99900; // ₹999 free shipping threshold (in paise)
export const SHIPPING_COST = 7900;       // ₹79 shipping (in paise)

export function formatPrice(paise) {
  if (paise == null) return '₹0';
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function WHATSAPP_PREORDER_MSG(orderNum) {
  return `Hi! I just placed an order (${orderNum}) on Press On Nails By Tara. Could you please share an update? Thank you! 💅`;
}

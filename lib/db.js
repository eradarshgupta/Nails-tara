// Data layer: uses Vercel KV when configured, falls back to demo products otherwise.
// Set KV_REST_API_URL + KV_REST_API_TOKEN in Vercel dashboard for persistence.

const DEMO_PRODUCTS = [
  {
    id: 'demo-1',
    slug: 'rose-chrome-coffin',
    name: 'Rosé Chrome Coffin',
    description: 'Dreamy rose chrome finish with a coffin shape. Perfect for date nights and celebrations.',
    price: 89900,
    sale_price: 74900,
    shapes: ['coffin'],
    lengths: ['medium', 'long'],
    finishes: ['chrome'],
    tags: ['bestseller', 'new'],
    images: ['https://images.pexels.com/photos/7664093/pexels-photo-7664093.jpeg?auto=compress&cs=tinysrgb&w=800'],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    slug: 'bridal-french-almond',
    name: 'Bridal French Almond',
    description: 'Classic French tip on a flattering almond shape. Timeless and elegant for brides.',
    price: 99900,
    sale_price: null,
    shapes: ['almond'],
    lengths: ['medium'],
    finishes: ['glossy'],
    tags: ['bridal', 'bestseller'],
    images: ['https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800'],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    slug: 'midnight-matte-square',
    name: 'Midnight Matte Square',
    description: 'Bold black matte square nails for the modern woman. Statement-making and fierce.',
    price: 79900,
    sale_price: null,
    shapes: ['square'],
    lengths: ['medium', 'long'],
    finishes: ['matte'],
    tags: ['new', 'bold'],
    images: ['https://images.pexels.com/photos/5128012/pexels-photo-5128012.jpeg?auto=compress&cs=tinysrgb&w=800'],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    slug: 'nude-glitter-stiletto',
    name: 'Nude Glitter Stiletto',
    description: 'Subtle nude base with fine glitter. Versatile enough for office to party.',
    price: 84900,
    sale_price: 69900,
    shapes: ['stiletto'],
    lengths: ['long', 'extra long'],
    finishes: ['glitter'],
    tags: ['everyday', 'festive'],
    images: ['https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=800'],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
];

const isKVConfigured = () =>
  !!(process.env.KV_REST_API_URL || process.env.KV_URL);

async function kvGet(key) {
  const { kv } = await import('@vercel/kv');
  return await kv.get(key);
}

async function kvSet(key, value) {
  const { kv } = await import('@vercel/kv');
  await kv.set(key, value);
}

export async function getProducts() {
  if (!isKVConfigured()) return [...DEMO_PRODUCTS];
  try {
    const data = await kvGet('products');
    return data ?? [...DEMO_PRODUCTS];
  } catch (e) {
    console.error('KV getProducts error:', e.message);
    return [...DEMO_PRODUCTS];
  }
}

export async function saveProducts(products) {
  if (!isKVConfigured()) return;
  try {
    await kvSet('products', products);
  } catch (e) {
    console.error('KV saveProducts error:', e.message);
  }
}

export async function getOrders() {
  if (!isKVConfigured()) return [];
  try {
    const data = await kvGet('orders');
    return data ?? [];
  } catch (e) {
    console.error('KV getOrders error:', e.message);
    return [];
  }
}

export async function saveOrders(orders) {
  if (!isKVConfigured()) return;
  try {
    await kvSet('orders', orders);
  } catch (e) {
    console.error('KV saveOrders error:', e.message);
  }
}

import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing env vars: SUPABASE_URL and SUPABASE_ANON_KEY');
  return createClient(url, key);
}

// ─── Products ────────────────────────────────────────────────

export async function getProducts() {
  const { data, error } = await getClient()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getProductBySlugOrId(slugOrId) {
  const { data } = await getClient()
    .from('products')
    .select('*')
    .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    .single();
  return data || null;
}

export async function createProduct(product) {
  const { data, error } = await getClient()
    .from('products')
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  const { data, error } = await getClient()
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await getClient().from('products').delete().eq('id', id);
  if (error) throw error;
}

// ─── Orders ──────────────────────────────────────────────────

export async function getOrders() {
  const { data, error } = await getClient()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createOrder(order) {
  const { data, error } = await getClient()
    .from('orders')
    .insert(order)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrder(id, updates) {
  const { data, error } = await getClient()
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

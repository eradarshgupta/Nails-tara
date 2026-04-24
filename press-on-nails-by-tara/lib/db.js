import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

export async function getProducts() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProductBySlug(slug) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data;
}

export async function saveProducts(products) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function createProduct(product) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id, updates) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getOrders() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveOrders(orders) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('orders')
    .upsert(orders, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function createOrder(order) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateOrder(id, updates) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

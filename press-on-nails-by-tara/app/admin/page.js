'use client';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  LogOut, Plus, Edit2, Trash2, Eye, EyeOff, Package, ShoppingBag,
  TrendingUp, Clock, Upload, X, ChevronDown, Save, Sparkles, Check,
  RefreshCw, ExternalLink
} from 'lucide-react';
import { formatPrice, formatDate, SHAPES, LENGTHS, FINISHES, TAGS, ORDER_STATUSES } from '@/lib/config';

const API = (path, opts = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('tara-admin-token') : '';
  return fetch(`/api${path}`, {
    ...opts,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
};

const EMPTY_PRODUCT = {
  name: '', description: '', price: '', sale_price: '',
  shapes: [], lengths: [], finishes: [], tags: [], images: [], in_stock: true,
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState('dashboard');

  // Dashboard
  const [stats, setStats] = useState(null);

  // Products
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImages, setPreviewImages] = useState([]); // { file, previewUrl }
  const fileInputRef = useRef(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('tara-admin-token');
    if (!token) { setChecking(false); return; }
    fetch('/api/admin/verify', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.valid) setAuthed(true); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (tab === 'dashboard') fetchStats();
    if (tab === 'products') fetchProducts();
    if (tab === 'orders') fetchOrders();
  }, [authed, tab]);

  const fetchStats = async () => {
    const r = await API('/admin/stats').catch(() => null);
    if (r?.ok) setStats(await r.json());
  };

  const fetchProducts = async () => {
    setProdLoading(true);
    const r = await API('/products?limit=50').catch(() => null);
    if (r?.ok) { const d = await r.json(); setProducts(d.products || []); }
    setProdLoading(false);
  };

  const fetchOrders = async () => {
    setOrderLoading(true);
    const r = await API('/orders').catch(() => null);
    if (r?.ok) { const d = await r.json(); setOrders(d.orders || []); }
    setOrderLoading(false);
  };

  const login = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const d = await r.json();
      if (r.ok && d.token) {
        localStorage.setItem('tara-admin-token', d.token);
        setAuthed(true);
        toast.success('Welcome back, Tara! 💅');
      } else {
        setLoginError(d.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Connection error. Please try again.');
    }
    setLoggingIn(false);
  };

  const logout = () => {
    localStorage.removeItem('tara-admin-token');
    setAuthed(false);
    toast.success('Logged out successfully.');
  };

  // Product CRUD
  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setPreviewImages([]);
    setShowProductForm(true);
  };

  const openEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price ? String(p.price / 100) : '',
      sale_price: p.sale_price ? String(p.sale_price / 100) : '',
      shapes: p.shapes || [],
      lengths: p.lengths || [],
      finishes: p.finishes || [],
      tags: p.tags || [],
      images: p.images || [],
      in_stock: p.in_stock !== false,
    });
    setPreviewImages([]);
    setShowProductForm(true);
  };

  const toggleArrItem = (key, val) => {
    setProductForm(prev => {
      const arr = prev[key] || [];
      const lower = val.toLowerCase();
      return {
        ...prev,
        [key]: arr.includes(lower) ? arr.filter(x => x !== lower) : [...arr, lower]
      };
    });
  };

  const handleImageFiles = (files) => {
    const newPreviews = Array.from(files).slice(0, 6 - previewImages.length).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setPreviewImages(prev => [...prev, ...newPreviews].slice(0, 6));
  };

  const removePreview = (i) => setPreviewImages(prev => prev.filter((_, idx) => idx !== i));
  const removeExistingImage = (i) => setProductForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  const saveProduct = async () => {
    if (!productForm.name.trim()) { toast.error('Product name is required'); return; }
    if (!productForm.price) { toast.error('Price is required'); return; }
    setSaving(true);

    try {
      // Upload new images
      let newImageUrls = [];
      if (previewImages.length > 0) {
        setUploadingImages(true);
        for (const { file } of previewImages) {
          const fd = new FormData();
          fd.append('file', file);
          const token = localStorage.getItem('tara-admin-token');
          const r = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          });
          if (r.ok) {
            const d = await r.json();
            newImageUrls.push(d.url);
          }
        }
        setUploadingImages(false);
      }

      const allImages = [...(productForm.images || []), ...newImageUrls];

      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Math.round(parseFloat(productForm.price) * 100),
        sale_price: productForm.sale_price ? Math.round(parseFloat(productForm.sale_price) * 100) : null,
        shapes: productForm.shapes,
        lengths: productForm.lengths,
        finishes: productForm.finishes,
        tags: productForm.tags,
        images: allImages,
        in_stock: productForm.in_stock,
      };

      let r;
      if (editingProduct) {
        r = await API(`/products/${editingProduct.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        r = await API('/products', { method: 'POST', body: JSON.stringify(payload) });
      }

      if (r.ok) {
        toast.success(editingProduct ? 'Product updated! ✓' : 'New design added to shop! 🎉');
        setShowProductForm(false);
        fetchProducts();
      } else {
        const d = await r.json();
        toast.error(d.error || 'Failed to save product');
      }
    } catch (e) {
      toast.error('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  const deleteProduct = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const r = await API(`/products/${id}`, { method: 'DELETE' });
    if (r.ok) { toast.success('Product deleted'); fetchProducts(); }
    else toast.error('Failed to delete');
  };

  const toggleStock = async (product) => {
    const r = await API(`/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify({ in_stock: !product.in_stock })
    });
    if (r.ok) { toast.success(`${product.name} marked ${!product.in_stock ? 'In Stock' : 'Out of Stock'}`); fetchProducts(); }
  };

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingStatus(true);
    const r = await API(`/orders/${orderId}`, { method: 'PUT', body: JSON.stringify({ order_status: status }) });
    if (r.ok) {
      toast.success(`Order marked as ${status}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, order_status: status }));
    }
    setUpdatingStatus(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-tara-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-3">🌸</div>
          <p className="text-tara-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tara-ivory to-tara-blush flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">💅</div>
            <h1 className="font-serif text-2xl text-tara-dark">Admin Login</h1>
            <p className="text-tara-muted text-sm mt-1">Press On Nails By Tara</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-tara-dark block mb-1.5">Email</label>
              <input
                type="email" value={loginForm.email}
                onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@taranails.com"
                className="w-full px-4 py-3 border-2 border-tara-blush rounded-xl text-base focus:outline-none focus:border-tara-pink transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-tara-dark block mb-1.5">Password</label>
              <input
                type="password" value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-tara-blush rounded-xl text-base focus:outline-none focus:border-tara-pink transition-colors"
                required
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{loginError}</p>
            )}
            <button
              type="submit" disabled={loggingIn}
              className="w-full bg-tara-pink text-white font-semibold py-4 rounded-2xl hover:bg-[#b5697a] transition-colors disabled:opacity-70 text-base"
            >
              {loggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs text-tara-muted mt-4">
            Default: admin@taranails.com / Tara@2024
          </p>
          <Link href="/" className="block text-center text-sm text-tara-pink mt-4 hover:underline">← Back to website</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-tara-pink" />
          <h1 className="font-serif text-xl text-tara-dark font-semibold">Tara Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="text-sm text-tara-muted hover:text-tara-pink flex items-center gap-1">
            <ExternalLink size={14} /> View Site
          </Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-tara-muted hover:text-red-500 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {[['dashboard', 'Dashboard', '📊'], ['products', 'Products', '💅'], ['orders', 'Orders', '📦']].map(([id, label, icon]) => (
            <button
              key={id} onClick={() => setTab(id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === id ? 'border-tara-pink text-tara-pink' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
              <button onClick={fetchStats} className="text-tara-muted hover:text-tara-pink"><RefreshCw size={16} /></button>
            </div>
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Today's Orders", value: stats.ordersToday, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Week Revenue', value: formatPrice(stats.weekRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
                  { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
                  { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-pink-50 text-pink-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className={`inline-flex p-2.5 rounded-xl mb-3 ${color}`}>
                      <Icon size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 h-28 animate-pulse" />)}
              </div>
            )}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setTab('products')} className="flex items-center gap-2 bg-tara-blush text-tara-pink px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-tara-pink hover:text-white transition-colors">
                  <Plus size={16} /> Add New Nail Design
                </button>
                <button onClick={() => setTab('orders')} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Package size={16} /> View All Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Products ({products.length})</h2>
              <button
                onClick={openNewProduct}
                className="flex items-center gap-2 bg-tara-pink text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#b5697a] transition-colors"
              >
                <Plus size={16} /> Add New Design
              </button>
            </div>

            {prodLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">💅</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No products yet</h3>
                <p className="text-gray-500 text-sm mb-4">Add your first nail design to get started!</p>
                <button onClick={openNewProduct} className="bg-tara-pink text-white px-6 py-3 rounded-xl font-medium hover:bg-[#b5697a] transition-colors">
                  Add First Design
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex gap-3 p-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-tara-blush flex-shrink-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center text-2xl">💅</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">{p.name}</p>
                        <p className="text-tara-pink font-bold text-sm">{formatPrice(p.sale_price || p.price)}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.tags?.slice(0,2).map(t => (
                            <span key={t} className="bg-tara-blush text-tara-pink text-[10px] px-2 py-0.5 rounded-full capitalize">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-4 flex items-center gap-2">
                      <button
                        onClick={() => toggleStock(p)}
                        className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-colors ${
                          p.in_stock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {p.in_stock ? '✓ In Stock' : '✗ Out of Stock'}
                      </button>
                      <button onClick={() => openEditProduct(p)} className="p-2 text-gray-500 hover:text-tara-pink hover:bg-tara-blush rounded-xl transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => deleteProduct(p.id, p.name)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Orders ({orders.length})</h2>
              <button onClick={fetchOrders} className="text-tara-muted hover:text-tara-pink flex items-center gap-1 text-sm">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {orderLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
                <p className="text-gray-500 text-sm">Orders will appear here once customers start buying.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-bold text-tara-pink text-sm">{order.order_number}</p>
                          <p className="font-medium text-gray-800 text-sm">{order.customer_name}</p>
                          <p className="text-gray-500 text-xs">{order.customer_phone} · {formatDate(order.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-gray-800">{formatPrice(order.total)}</p>
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.order_status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="text-xs text-gray-500 hover:text-tara-pink flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-tara-blush transition-colors"
                      >
                        <Eye size={12} /> {selectedOrder?.id === order.id ? 'Hide' : 'View Details'}
                      </button>
                      <a
                        href={`https://wa.me/91${order.customer_phone}?text=${encodeURIComponent(`Hi ${order.customer_name}! Your order ${order.order_number} update:`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        💬 WhatsApp
                      </a>
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-xs text-gray-500">Status:</span>
                        <select
                          value={order.order_status}
                          onChange={e => updateOrderStatus(order.id, e.target.value)}
                          disabled={updatingStatus}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-tara-pink"
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>

                    {selectedOrder?.id === order.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Items Ordered:</p>
                        <div className="space-y-1.5">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-gray-700">
                              <span className="flex-1">{item.name} ×{item.quantity}{item.options?.shape ? ` (${item.options.shape})` : ''}</span>
                              <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                          <p><span className="font-medium">Address:</span> {order.delivery_address?.line1}, {order.delivery_address?.city}, {order.delivery_address?.state} – {order.delivery_address?.pincode}</p>
                          <p className="mt-0.5"><span className="font-medium">Email:</span> {order.customer_email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-t-3xl md:rounded-3xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-serif text-xl text-tara-dark">{editingProduct ? 'Edit Design' : 'Add New Nail Design'}</h2>
              <button onClick={() => setShowProductForm(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Images */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Product Photos (up to 6)</label>
                {/* Existing images */}
                {productForm.images?.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {productForm.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-tara-blush">
                        <img src={img} alt={`img${i}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeExistingImage(i)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* New previews */}
                {previewImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {previewImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-tara-pink">
                        <img src={img.previewUrl} alt={`preview${i}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePreview(i)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {(productForm.images?.length + previewImages.length) < 6 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleImageFiles(e.dataTransfer.files); }}
                    className="border-2 border-dashed border-tara-blush rounded-2xl p-8 text-center cursor-pointer hover:border-tara-pink hover:bg-tara-ivory transition-all"
                  >
                    <Upload size={28} className="text-tara-pink mx-auto mb-2" />
                    <p className="text-sm font-medium text-tara-dark">Tap to upload or drag & drop</p>
                    <p className="text-xs text-tara-muted mt-1">JPG, PNG up to 5MB each</p>
                    <input
                      ref={fileInputRef} type="file" accept="image/*" multiple
                      onChange={e => handleImageFiles(e.target.files)}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Design Name *</label>
                <input
                  type="text" value={productForm.name}
                  onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Rosé Chrome Coffin"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-tara-pink transition-colors"
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Price (₹) *</label>
                  <input
                    type="number" value={productForm.price}
                    onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="999"
                    min="0" step="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-tara-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Sale Price (₹) <span className="font-normal text-gray-400">(optional)</span></label>
                  <input
                    type="number" value={productForm.sale_price}
                    onChange={e => setProductForm(p => ({ ...p, sale_price: e.target.value }))}
                    placeholder="799"
                    min="0" step="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-tara-pink transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the nail design, finish, occasions..."
                  rows={3} maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-tara-pink transition-colors resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{productForm.description.length}/500</p>
              </div>

              {/* Shape */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Shape</label>
                <div className="flex flex-wrap gap-2">
                  {SHAPES.map(s => (
                    <button
                      key={s} type="button"
                      onClick={() => toggleArrItem('shapes', s)}
                      className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
                        productForm.shapes.includes(s.toLowerCase())
                          ? 'border-tara-pink bg-tara-pink text-white'
                          : 'border-gray-200 text-gray-600 hover:border-tara-pink'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Length</label>
                <div className="flex flex-wrap gap-2">
                  {LENGTHS.map(l => (
                    <button
                      key={l} type="button"
                      onClick={() => toggleArrItem('lengths', l)}
                      className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
                        productForm.lengths.includes(l.toLowerCase())
                          ? 'border-tara-pink bg-tara-pink text-white'
                          : 'border-gray-200 text-gray-600 hover:border-tara-pink'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Finish</label>
                <div className="flex flex-wrap gap-2">
                  {FINISHES.map(f => (
                    <button
                      key={f} type="button"
                      onClick={() => toggleArrItem('finishes', f)}
                      className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
                        productForm.finishes.includes(f.toLowerCase())
                          ? 'border-tara-pink bg-tara-pink text-white'
                          : 'border-gray-200 text-gray-600 hover:border-tara-pink'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Category Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => toggleArrItem('tags', t)}
                      className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
                        productForm.tags.includes(t.toLowerCase())
                          ? 'border-tara-gold bg-tara-gold text-white'
                          : 'border-gray-200 text-gray-600 hover:border-tara-gold'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-5 py-4">
                <div>
                  <p className="font-semibold text-gray-700 text-sm">In Stock</p>
                  <p className="text-xs text-gray-400">Toggle to hide/show in shop</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProductForm(p => ({ ...p, in_stock: !p.in_stock }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    productForm.in_stock ? 'bg-tara-pink' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    productForm.in_stock ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={saveProduct}
                disabled={saving || uploadingImages}
                className="w-full bg-tara-pink text-white font-semibold py-4 rounded-2xl hover:bg-[#b5697a] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-base"
              >
                {saving || uploadingImages ? (
                  <><RefreshCw size={18} className="animate-spin" /> {uploadingImages ? 'Uploading images...' : 'Saving...'}</>
                ) : (
                  <><Save size={18} /> {editingProduct ? 'Update Design' : 'Add to Shop'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

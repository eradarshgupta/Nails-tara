'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { formatPrice, SHAPES, LENGTHS, FINISHES } from '@/lib/config';
import { toast } from 'sonner';
import { SlidersHorizontal, X, Search, ShoppingBag } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function ProductCard({ product, onAddToCart }) {
  const [hovered, setHovered] = useState(false);
  const imgSrc = hovered && product.images?.[1] ? product.images[1] : product.images?.[0];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <Link href={`/shop/${product.slug}`}>
        <div
          className="aspect-[3/4] overflow-hidden bg-tara-blush relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">💅</div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.tags?.includes('bestseller') && (
              <span className="bg-tara-gold text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Bestseller</span>
            )}
            {product.tags?.includes('new') && (
              <span className="bg-tara-pink text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>
            )}
            {product.tags?.includes('bridal') && (
              <span className="bg-purple-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Bridal</span>
            )}
          </div>
          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full">Sold Out</span>
            </div>
          )}
        </div>
        <div className="p-3 md:p-4">
          <h3 className="font-medium text-tara-dark text-sm md:text-base leading-tight line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-tara-pink font-semibold text-sm md:text-base">
              {formatPrice(product.sale_price || product.price)}
            </span>
            {product.sale_price && (
              <span className="text-tara-muted text-xs line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          {product.shapes?.length > 0 && (
            <p className="text-tara-muted text-xs mt-1 capitalize">{product.shapes.join(' · ')}</p>
          )}
        </div>
      </Link>
      {product.in_stock ? (
        <button
          onClick={() => onAddToCart(product)}
          className="w-full bg-tara-blush hover:bg-tara-pink hover:text-white text-tara-pink text-xs md:text-sm font-semibold py-3 transition-colors rounded-b-2xl"
        >
          + Add to Cart
        </button>
      ) : (
        <div className="w-full bg-gray-50 text-gray-400 text-xs font-medium py-3 text-center rounded-b-2xl">Out of Stock</div>
      )}
    </div>
  );
}

export default function ShopPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ shape: '', length: '', finish: '', sort: 'newest', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.shape) params.set('shape', filters.shape.toLowerCase());
    if (filters.length) params.set('length', filters.length.toLowerCase());
    if (filters.finish) params.set('finish', filters.finish.toLowerCase());
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.search) params.set('search', filters.search);
    params.set('limit', '24');

    const res = await fetch(`/api/products?${params}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAddToCart = (product) => {
    addItem(product, {}, 1);
    toast.success(`${product.name} added! 💅`);
  };

  const clearFilter = (key) => setFilters(prev => ({ ...prev, [key]: '' }));
  const activeFilters = ['shape', 'length', 'finish'].filter(k => filters[k]);

  return (
    <main className="min-h-screen bg-tara-ivory pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-tara-blush py-8">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl text-tara-dark">All Designs</h1>
          <p className="text-tara-muted mt-1 text-sm">{total} handcrafted sets available</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-16 z-20 bg-white border-b border-tara-blush shadow-sm">
        <div className="container py-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {/* Search */}
            <div className="relative flex-shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tara-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-8 pr-3 py-2 text-sm border border-tara-blush rounded-full w-32 md:w-44 focus:outline-none focus:ring-2 focus:ring-tara-pink/30 bg-tara-ivory"
              />
            </div>

            {/* Shape Filter */}
            <select
              value={filters.shape}
              onChange={e => setFilters(prev => ({ ...prev, shape: e.target.value }))}
              className="text-sm border border-tara-blush rounded-full px-3 py-2 bg-tara-ivory focus:outline-none focus:ring-2 focus:ring-tara-pink/30 cursor-pointer flex-shrink-0"
            >
              <option value="">All Shapes</option>
              {SHAPES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
            </select>

            {/* Length Filter */}
            <select
              value={filters.length}
              onChange={e => setFilters(prev => ({ ...prev, length: e.target.value }))}
              className="text-sm border border-tara-blush rounded-full px-3 py-2 bg-tara-ivory focus:outline-none focus:ring-2 focus:ring-tara-pink/30 cursor-pointer flex-shrink-0"
            >
              <option value="">All Lengths</option>
              {LENGTHS.map(l => <option key={l} value={l.toLowerCase()}>{l}</option>)}
            </select>

            {/* Finish Filter */}
            <select
              value={filters.finish}
              onChange={e => setFilters(prev => ({ ...prev, finish: e.target.value }))}
              className="text-sm border border-tara-blush rounded-full px-3 py-2 bg-tara-ivory focus:outline-none focus:ring-2 focus:ring-tara-pink/30 cursor-pointer flex-shrink-0"
            >
              <option value="">All Finishes</option>
              {FINISHES.map(f => <option key={f} value={f.toLowerCase()}>{f}</option>)}
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              className="text-sm border border-tara-blush rounded-full px-3 py-2 bg-tara-ivory focus:outline-none focus:ring-2 focus:ring-tara-pink/30 cursor-pointer flex-shrink-0 ml-auto"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activeFilters.map(k => (
                <span key={k} className="flex items-center gap-1 bg-tara-pink text-white text-xs px-3 py-1 rounded-full">
                  {filters[k]}
                  <button onClick={() => clearFilter(k)} className="hover:opacity-70"><X size={11} /></button>
                </span>
              ))}
              <button onClick={() => setFilters(prev => ({ ...prev, shape: '', length: '', finish: '' }))}
                className="text-xs text-tara-muted hover:text-tara-pink underline ml-1">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-tara-blush" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-tara-blush rounded w-3/4" />
                  <div className="h-3 bg-tara-blush rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💅</div>
            <h3 className="font-serif text-2xl text-tara-dark mb-2">No designs found</h3>
            <p className="text-tara-muted mb-6">Try adjusting your filters to find the perfect set.</p>
            <button
              onClick={() => setFilters({ shape: '', length: '', finish: '', sort: 'newest', search: '' })}
              className="bg-tara-pink text-white px-6 py-3 rounded-full font-medium hover:bg-[#b5697a] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

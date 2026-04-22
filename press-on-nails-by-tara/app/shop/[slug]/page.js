'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { formatPrice, WHATSAPP_NUMBER } from '@/lib/config';
import { toast } from 'sonner';
import { ChevronLeft, ShoppingBag, Minus, Plus, ChevronDown, MessageCircle } from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addItem, setIsCartOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedShape, setSelectedShape] = useState('');
  const [selectedLength, setSelectedLength] = useState('');
  const [openTab, setOpenTab] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
          if (data.product.shapes?.length > 0) setSelectedShape(data.product.shapes[0]);
          if (data.product.lengths?.length > 0) setSelectedLength(data.product.lengths[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, { shape: selectedShape, length: selectedLength }, quantity);
    toast.success(`${product.name} added to cart! 💅`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, { shape: selectedShape, length: selectedLength }, quantity);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tara-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">💅</div>
          <p className="text-tara-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-tara-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😢</div>
          <h2 className="font-serif text-2xl text-tara-dark mb-3">Product not found</h2>
          <Link href="/shop" className="text-tara-pink font-medium hover:underline">← Back to Shop</Link>
        </div>
      </div>
    );
  }

  const price = product.sale_price || product.price;

  return (
    <main className="min-h-screen bg-tara-ivory pb-32 md:pb-0">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-tara-blush">
        <div className="container py-3 flex items-center gap-2 text-sm text-tara-muted">
          <Link href="/" className="hover:text-tara-pink transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-tara-pink transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-tara-dark font-medium line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="container py-6 md:py-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-tara-blush mb-3">
              {product.images?.[selectedImg] ? (
                <img
                  src={product.images[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">💅</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImg === i ? 'border-tara-pink' : 'border-transparent hover:border-tara-blush'
                    }`}
                  >
                    <img src={img} alt={`View ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.tags?.includes('bestseller') && (
                <span className="bg-tara-gold text-white text-xs font-semibold px-3 py-1 rounded-full">⭐ Bestseller</span>
              )}
              {product.tags?.includes('new') && (
                <span className="bg-tara-pink text-white text-xs font-semibold px-3 py-1 rounded-full">✨ New Arrival</span>
              )}
              {product.tags?.includes('bridal') && (
                <span className="bg-purple-400 text-white text-xs font-semibold px-3 py-1 rounded-full">💍 Bridal Pick</span>
              )}
            </div>

            <h1 className="font-serif text-2xl md:text-3xl text-tara-dark mb-3 leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-bold text-tara-pink">{formatPrice(price)}</span>
              {product.sale_price && (
                <>
                  <span className="text-lg text-tara-muted line-through">{formatPrice(product.price)}</span>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {Math.round((1 - product.sale_price / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            <p className="text-tara-muted text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Shape Selector */}
            {product.shapes?.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-tara-dark block mb-2">
                  Shape: <span className="capitalize font-medium text-tara-pink">{selectedShape}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.shapes.map(shape => (
                    <button
                      key={shape}
                      onClick={() => setSelectedShape(shape)}
                      className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all capitalize ${
                        selectedShape === shape
                          ? 'border-tara-pink bg-tara-pink text-white'
                          : 'border-tara-blush text-tara-dark hover:border-tara-pink'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Length Selector */}
            {product.lengths?.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-tara-dark block mb-2">
                  Length: <span className="capitalize font-medium text-tara-pink">{selectedLength}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.lengths.map(len => (
                    <button
                      key={len}
                      onClick={() => setSelectedLength(len)}
                      className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all capitalize ${
                        selectedLength === len
                          ? 'border-tara-pink bg-tara-pink text-white'
                          : 'border-tara-blush text-tara-dark hover:border-tara-pink'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Guide */}
            <button
              onClick={() => setShowSizeGuide(!showSizeGuide)}
              className="flex items-center gap-1 text-xs text-tara-pink underline underline-offset-2 mb-5"
            >
              📏 How to measure your nail size <ChevronDown size={12} className={`transition-transform ${showSizeGuide ? 'rotate-180' : ''}`} />
            </button>
            {showSizeGuide && (
              <div className="bg-tara-blush rounded-2xl p-4 mb-5 text-sm text-tara-dark">
                <p className="font-semibold mb-2">How to find your nail size:</p>
                <ol className="list-decimal list-inside space-y-1 text-tara-muted">
                  <li>Use a flexible measuring tape or a strip of paper.</li>
                  <li>Measure the widest part of each finger from one side to the other.</li>
                  <li>Use the measurement in mm to select your size (1 cm = 10 mm).</li>
                  <li>Each set comes with sizes 0–9 (24 nails). Most people use 3–5.</li>
                </ol>
                <p className="mt-2 text-tara-muted italic">Still unsure? WhatsApp us with a photo of your hand!</p>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-tara-dark">Qty:</span>
              <div className="flex items-center border-2 border-tara-blush rounded-full">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 h-10 flex items-center justify-center hover:bg-tara-blush rounded-full transition-colors">
                  <Minus size={14} className="text-tara-dark" />
                </button>
                <span className="w-8 text-center font-semibold text-tara-dark">{quantity}</span>
                <button onClick={() => setQuantity(q => q+1)} className="w-10 h-10 flex items-center justify-center hover:bg-tara-blush rounded-full transition-colors">
                  <Plus size={14} className="text-tara-dark" />
                </button>
              </div>
              <span className="text-sm text-tara-muted">Set of 24 nails</span>
            </div>

            {/* Buttons (Desktop) */}
            <div className="hidden md:flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="flex-1 bg-tara-blush hover:bg-tara-pink hover:text-white text-tara-pink font-semibold py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.in_stock}
                className="flex-1 bg-tara-pink hover:bg-[#b5697a] text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Buy Now
              </button>
            </div>

            {/* Trust */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-tara-muted">
              {['🚚 Ships in 3-5 days', '♻ Reusable 5x', '↩ Easy returns'].map(t => (
                <div key={t} className="text-center bg-tara-ivory rounded-xl py-2">{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 md:mt-14">
          <div className="flex border-b border-tara-blush mb-6 overflow-x-auto scrollbar-hide">
            {[['description', 'Description'], ['howto', 'How to Apply'], ['care', 'Care & Reuse']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setOpenTab(id)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  openTab === id ? 'border-tara-pink text-tara-pink' : 'border-transparent text-tara-muted hover:text-tara-dark'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {openTab === 'description' && (
            <div className="max-w-2xl text-tara-muted leading-relaxed text-sm">
              <p>{product.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {product.shapes?.length > 0 && <div><span className="font-semibold text-tara-dark">Shape:</span> <span className="capitalize">{product.shapes.join(', ')}</span></div>}
                {product.lengths?.length > 0 && <div><span className="font-semibold text-tara-dark">Length:</span> <span className="capitalize">{product.lengths.join(', ')}</span></div>}
                {product.finishes?.length > 0 && <div><span className="font-semibold text-tara-dark">Finish:</span> <span className="capitalize">{product.finishes.join(', ')}</span></div>}
                <div><span className="font-semibold text-tara-dark">Pieces:</span> 24 nails per set</div>
              </div>
            </div>
          )}
          {openTab === 'howto' && (
            <div className="max-w-2xl text-sm">
              <ol className="space-y-3">
                {[
                  'Clean your natural nails with the included prep pad.',
                  'Select the press-on that best fits each finger.',
                  'Peel the adhesive tab (or apply provided nail glue for longer wear).',
                  'Press firmly for 30 seconds, starting from the cuticle down.',
                  'Done! Your nails are ready to show off.',
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-tara-pink text-white rounded-full text-xs flex items-center justify-center font-bold">{i+1}</span>
                    <span className="text-tara-muted">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {openTab === 'care' && (
            <div className="max-w-2xl text-sm text-tara-muted space-y-3">
              <p>✦ These nails are designed to last <strong className="text-tara-dark">2–3 weeks</strong> with regular wear.</p>
              <p>✦ To remove: soak fingers in warm soapy water for 5 minutes, then gently lift from the sides.</p>
              <p>✦ Store removed nails in the original box for reuse up to <strong className="text-tara-dark">5 times</strong>.</p>
              <p>✦ Clean with mild soap before each reuse and reapply adhesive tabs (sold separately).</p>
              <p>✦ Avoid prolonged soaking (swimming, long baths) to extend wear time.</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif text-2xl text-tara-dark mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} href={`/shop/${p.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-[3/4] overflow-hidden bg-tara-blush">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">💅</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-tara-dark text-sm line-clamp-2">{p.name}</p>
                    <p className="text-tara-pink font-semibold text-sm mt-1">{formatPrice(p.sale_price || p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar (Mobile) */}
      {product.in_stock && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-20 bg-white border-t border-tara-blush p-3 flex gap-3 shadow-lg">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-tara-blush hover:bg-tara-pink hover:text-white text-tara-pink font-semibold py-3.5 rounded-2xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} /> Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-tara-pink text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm"
          >
            Buy Now — {formatPrice(price * quantity)}
          </button>
        </div>
      )}
    </main>
  );
}

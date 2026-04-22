'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { formatPrice, BUSINESS_NAME, WHATSAPP_NUMBER, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/lib/config';
import { toast } from 'sonner';
import { ArrowRight, Star, RefreshCw, Truck, Heart, Sparkles, ChevronRight, Phone, Instagram } from 'lucide-react';

const HERO_IMG = 'https://images.pexels.com/photos/7664093/pexels-photo-7664093.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1200';

const TRUST_BADGES = [
  { icon: '✦', text: 'Handcrafted with Love' },
  { icon: '♻', text: 'Reusable up to 5x' },
  { icon: '🚚', text: 'Ships in 3-5 Days' },
  { icon: '↩', text: 'Easy Returns' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '💅', title: 'Choose Your Style', desc: 'Browse our curated collection and pick the design that speaks to you.' },
  { step: '02', icon: '📏', title: 'Select Your Size', desc: 'Use our size guide to pick the perfect fit — no salon needed.' },
  { step: '03', icon: '🛒', title: 'Place Your Order', desc: 'Checkout in under 2 minutes. We hand-pack every set with love.' },
  { step: '04', icon: '✨', title: 'Wear & Shine', desc: 'Apply at home in 10 mins. Lasts 2–3 weeks, reusable up to 5 times!' },
];

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="group flex-shrink-0 w-44 md:w-56 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <Link href={`/shop/${product.slug}`}>
        <div className="aspect-[3/4] overflow-hidden bg-tara-blush relative">
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {product.tags?.includes('bestseller') && (
            <span className="absolute top-2 left-2 bg-tara-gold text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">Bestseller</span>
          )}
          {product.tags?.includes('new') && (
            <span className="absolute top-2 left-2 bg-tara-pink text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>
          )}
          {product.tags?.includes('bridal') && (
            <span className="absolute top-2 left-2 bg-purple-400 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">Bridal</span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-tara-dark text-sm leading-tight line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-tara-pink font-semibold text-sm">{formatPrice(product.sale_price || product.price)}</span>
            {product.sale_price && (
              <span className="text-tara-muted text-xs line-through">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={() => onAddToCart(product)}
        className="w-full bg-tara-blush hover:bg-tara-pink hover:text-white text-tara-pink text-xs font-semibold py-2.5 transition-colors rounded-b-2xl"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default function HomePage() {
  const { addItem } = useCart();
  const [collections, setCollections] = useState({ bestsellers: [], newArrivals: [], bridal: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?tag=bestseller&limit=6').then(r => r.json()).catch(() => ({ products: [] })),
      fetch('/api/products?tag=new&limit=6').then(r => r.json()).catch(() => ({ products: [] })),
      fetch('/api/products?tag=bridal&limit=6').then(r => r.json()).catch(() => ({ products: [] })),
    ]).then(([best, newA, brid]) => {
      setCollections({
        bestsellers: best.products || [],
        newArrivals: newA.products || [],
        bridal: brid.products || [],
      });
      setLoading(false);
    });
  }, []);

  const handleAddToCart = (product) => {
    addItem(product, {}, 1);
    toast.success(`${product.name} added to cart!`, { description: 'Tap the cart icon to checkout.' });
  };

  const featuredCollections = [
    { label: 'Bestsellers', emoji: '⭐', products: collections.bestsellers },
    { label: 'New Arrivals', emoji: '✨', products: collections.newArrivals },
    { label: 'Bridal Collection', emoji: '💍', products: collections.bridal },
  ].filter(c => c.products.length > 0);

  return (
    <main className="pb-16 md:pb-0">
      {/* Hero */}
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Press On Nails" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        </div>
        <div className="relative z-10 text-center text-white px-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={16} className="text-tara-gold" />
            <p className="text-sm uppercase tracking-[0.25em] opacity-90 font-sans font-light">Handcrafted with Love</p>
            <Sparkles size={16} className="text-tara-gold" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl mb-5 leading-tight">
            Press On Nails<br />
            <span className="italic text-tara-blush">By Tara</span>
          </h1>
          <p className="text-base md:text-xl mb-8 opacity-90 font-sans font-light max-w-md mx-auto leading-relaxed">
            Salon-quality nails from the comfort of your home.
            <span className="block mt-1 text-tara-gold">Reusable up to 5 times. Lasts 2–3 weeks.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop">
              <button className="bg-white text-tara-dark hover:bg-tara-ivory px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 flex items-center gap-2 justify-center">
                Shop Now <ArrowRight size={18} />
              </button>
            </Link>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              <button className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold text-base transition-all flex items-center gap-2 justify-center">
                <Phone size={16} /> WhatsApp Us
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-tara-pink py-4 overflow-x-auto">
        <div className="flex items-center justify-start md:justify-center gap-6 md:gap-12 px-6 min-w-max md:min-w-0">
          {TRUST_BADGES.map((b, i) => (
            <span key={i} className="text-white text-sm font-medium whitespace-nowrap">
              {b.icon} {b.text}
            </span>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="aspect-square rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544816135-b44f18b3c5d6?w=800&q=80"
                alt="Our Story"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-tara-pink text-sm uppercase tracking-widest font-medium mb-3">Our Story</p>
              <h2 className="font-serif text-3xl md:text-4xl text-tara-dark mb-5 leading-tight">
                Nails that tell
                <em className="italic"> your story</em>
              </h2>
              <p className="text-tara-muted leading-relaxed mb-4">
                Hi, I'm Tara — a passionate nail artist creating one-of-a-kind press-on nail sets from my studio. Every set is handcrafted, never mass-produced.
              </p>
              <p className="text-tara-muted leading-relaxed mb-6">
                I started this because I believe every woman deserves beautiful nails without the salon price tag or weekly appointments. My nails last 2–3 weeks and can be reused up to 5 times.
              </p>
              <Link href="/shop">
                <button className="flex items-center gap-2 text-tara-pink font-semibold hover:gap-4 transition-all">
                  Explore All Designs <ChevronRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      {(loading || featuredCollections.length > 0) && (
        <section className="py-12 md:py-20 bg-tara-ivory">
          <div className="container">
            <h2 className="font-serif text-3xl md:text-4xl text-tara-dark text-center mb-12">
              Shop by Collection
            </h2>

            {loading ? (
              <div className="text-center py-12 text-tara-muted">Loading beautiful nails...</div>
            ) : (
              featuredCollections.map(({ label, emoji, products }) => (
                <div key={label} className="mb-12">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-serif text-2xl text-tara-dark">{emoji} {label}</h3>
                    <Link href={`/shop?tag=${label.toLowerCase().replace(/ /g, '')}`}
                      className="text-sm text-tara-pink font-medium hover:underline flex items-center gap-1">
                      View all <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-tara-pink text-sm uppercase tracking-widest font-medium mb-3">Simple & Easy</p>
            <h2 className="font-serif text-3xl md:text-4xl text-tara-dark">How It Works</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-tara-blush rounded-2xl text-3xl mb-4">
                  {icon}
                </div>
                <p className="text-tara-pink text-xs font-bold uppercase tracking-widest mb-2">Step {step}</p>
                <h4 className="font-serif text-lg text-tara-dark mb-2">{title}</h4>
                <p className="text-tara-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-tara-pink to-[#b5697a] text-white">
        <div className="container text-center">
          <h2 className="font-serif text-3xl md:text-5xl mb-4 leading-tight">
            Ready for your dream nails?
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto font-sans">
            Browse 20+ handcrafted designs. From everyday minimal to bold statement nails.
          </p>
          <Link href="/shop">
            <button className="bg-white text-tara-pink hover:bg-tara-ivory px-10 py-4 rounded-full font-semibold text-base transition-all hover:scale-105">
              Shop All Designs
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-tara-dark text-white/80 py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-tara-gold" />
                <span className="font-serif text-white text-lg font-medium">Press On Nails By Tara</span>
              </div>
              <p className="text-sm leading-relaxed">Handcrafted press-on nails made with love. Salon quality, home convenience.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-tara-pink transition-colors">Home</Link></li>
                <li><Link href="/shop" className="hover:text-tara-pink transition-colors">Shop</Link></li>
                <li><Link href="/admin" className="hover:text-tara-pink transition-colors">Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="space-y-2 text-sm">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-tara-pink transition-colors">
                  <Phone size={14} /> WhatsApp Us
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-tara-pink transition-colors">
                  <Instagram size={14} /> {INSTAGRAM_HANDLE}
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-xs">
            © 2025 Press On Nails By Tara. Made with ♥ in India.
          </div>
        </div>
      </footer>
    </main>
  );
}

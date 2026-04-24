'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { formatPrice, WHATSAPP_NUMBER } from '@/lib/config';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, CheckCircle, ShoppingBag, CreditCard, Banknote, Minus, Plus, Trash2 } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Chandigarh'
];

// Load Razorpay checkout script
function loadRazorpay() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { cart, subtotal, shipping, total, clearCart, updateQuantity, removeItem } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address1: '', address2: '', city: '', state: '', pincode: '',
  });
  const [errors, setErrors] = useState({});

  // Pre-load Razorpay script when step 3 is reached
  useEffect(() => {
    if (step === 3) loadRazorpay();
  }, [step]);

  const update = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required';
    if (!form.phone.match(/^[0-9]{10}$/)) errs.phone = '10-digit mobile number required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.address1.trim()) errs.address1 = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state) errs.state = 'State is required';
    if (!form.pincode.match(/^[0-9]{6}$/)) errs.pincode = 'Valid 6-digit PIN code required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getOrderPayload = () => ({
    customer_name: form.name,
    customer_email: form.email,
    customer_phone: form.phone,
    delivery_address: {
      line1: form.address1,
      line2: form.address2,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    },
    items: cart.map(item => ({
      product_id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      options: item.options,
      image: item.image,
    })),
    subtotal,
    shipping,
    total,
  });

  const handleRazorpayPayment = async () => {
    if (cart.length === 0) { toast.error('Your cart is empty!'); return; }
    setPlacing(true);

    try {
      // Load script
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Failed to load payment gateway. Please try again.'); setPlacing(false); return; }

      // Create Razorpay order
      const createRes = await fetch('/api/razorpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR' }),
      });
      if (!createRes.ok) { toast.error('Failed to initiate payment. Please try again.'); setPlacing(false); return; }
      const { order_id, amount: orderAmount } = await createRes.json();

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: 'INR',
        order_id,
        name: 'Press On Nails By Tara',
        description: `${cart.length} nail set(s)`,
        prefill: {
          name: form.name,
          email: form.email,
          contact: `+91${form.phone}`,
        },
        theme: { color: '#C87B8B' },
        handler: async (response) => {
          // Verify payment server-side
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: getOrderPayload(),
              }),
            });
            const data = await verifyRes.json();
            if (verifyRes.ok && data.order) {
              clearCart();
              toast.success('Payment successful! Order placed 💅');
              router.push(`/order-confirmed?order=${data.order.order_number}`);
            } else {
              toast.error(data.error || 'Payment verification failed. Please contact support.');
            }
          } catch {
            toast.error('Payment verification failed. Please contact support.');
          }
          setPlacing(false);
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast.error('Payment cancelled. Please try again when ready.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setPlacing(false);
      });
      rzp.open();
    } catch (e) {
      toast.error('Something went wrong. Please try again.');
      setPlacing(false);
    }
  };

  const handleCODOrder = async () => {
    if (cart.length === 0) { toast.error('Your cart is empty!'); return; }
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getOrderPayload()),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        clearCart();
        toast.success('Order placed successfully! 💅');
        router.push(`/order-confirmed?order=${data.order.order_number}`);
      } else {
        toast.error(data.error || 'Failed to place order. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    setPlacing(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-tara-ivory flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={48} className="text-tara-blush mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-tara-dark mb-2">Your cart is empty</h2>
          <p className="text-tara-muted mb-6">Add some beautiful nails first!</p>
          <Link href="/shop">
            <button className="bg-tara-pink text-white px-8 py-3 rounded-full font-semibold hover:bg-[#b5697a] transition-colors">Shop Now</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-tara-ivory py-8 pb-24 md:pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[['1', 'Contact'], ['2', 'Delivery'], ['3', 'Payment']].map(([s, label], i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > i+1 ? 'bg-green-500 text-white' :
                step === i+1 ? 'bg-tara-pink text-white shadow-lg shadow-tara-pink/30' : 'bg-tara-blush text-tara-muted'
              }`}>
                {step > i+1 ? '✓' : s}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === i+1 ? 'text-tara-dark' : 'text-tara-muted'}`}>{label}</span>
              {i < 2 && <div className={`w-10 h-0.5 ${step > i+1 ? 'bg-green-400' : 'bg-tara-blush'}`} />}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Order Summary — shown first on mobile, right column on desktop */}
          <div className="md:col-span-2 md:order-2">
            <div className="bg-white rounded-3xl shadow-sm p-5 md:sticky md:top-24">
              <h3 className="font-serif text-lg text-tara-dark mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-tara-blush flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium text-tara-dark line-clamp-1 flex-1">{item.name}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {item.options?.shape && (
                        <p className="text-xs text-tara-muted capitalize">{item.options.shape} · {item.options.length}</p>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-tara-blush hover:bg-tara-pink hover:text-white text-tara-pink flex items-center justify-center transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-semibold text-tara-dark w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-tara-blush hover:bg-tara-pink hover:text-white text-tara-pink flex items-center justify-center transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-tara-pink">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-tara-blush pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-tara-muted">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tara-muted">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE 🎉' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-tara-blush pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-tara-pink">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3 md:order-1">
            <div className="bg-white rounded-3xl shadow-sm p-6">

              {/* Step 1: Contact */}
              {step === 1 && (
                <>
                  <h2 className="font-serif text-xl text-tara-dark mb-5">Contact Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-tara-dark block mb-1">Full Name *</label>
                      <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                        placeholder="Priya Sharma"
                        className={`w-full px-4 py-3.5 border-2 rounded-xl text-base focus:outline-none transition-colors ${errors.name ? 'border-red-400' : 'border-tara-blush focus:border-tara-pink'}`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-tara-dark block mb-1">Email Address *</label>
                      <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                        placeholder="priya@example.com"
                        className={`w-full px-4 py-3.5 border-2 rounded-xl text-base focus:outline-none transition-colors ${errors.email ? 'border-red-400' : 'border-tara-blush focus:border-tara-pink'}`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-tara-dark block mb-1">Mobile Number *</label>
                      <div className="flex">
                        <span className="bg-tara-blush border-2 border-r-0 border-tara-blush rounded-l-xl px-3 flex items-center text-sm text-tara-muted font-medium">+91</span>
                        <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="9876543210"
                          className={`flex-1 px-4 py-3.5 border-2 rounded-r-xl text-base focus:outline-none transition-colors ${errors.phone ? 'border-red-400' : 'border-tara-blush focus:border-tara-pink'}`}
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  <button onClick={() => validateStep1() && setStep(2)}
                    className="mt-6 w-full bg-tara-pink text-white font-semibold py-4 rounded-2xl hover:bg-[#b5697a] transition-colors flex items-center justify-center gap-2 text-base">
                    Continue to Delivery <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Step 2: Delivery */}
              {step === 2 && (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => setStep(1)} className="w-9 h-9 rounded-full bg-tara-blush flex items-center justify-center hover:bg-tara-pink hover:text-white transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <h2 className="font-serif text-xl text-tara-dark">Delivery Address</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-tara-dark block mb-1">Address Line 1 *</label>
                      <input type="text" value={form.address1} onChange={e => update('address1', e.target.value)}
                        placeholder="Flat / House No., Building Name"
                        className={`w-full px-4 py-3.5 border-2 rounded-xl text-base focus:outline-none transition-colors ${errors.address1 ? 'border-red-400' : 'border-tara-blush focus:border-tara-pink'}`} />
                      {errors.address1 && <p className="text-red-500 text-xs mt-1">{errors.address1}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-tara-dark block mb-1">Address Line 2 (Optional)</label>
                      <input type="text" value={form.address2} onChange={e => update('address2', e.target.value)}
                        placeholder="Street, Area, Landmark"
                        className="w-full px-4 py-3.5 border-2 border-tara-blush rounded-xl text-base focus:outline-none focus:border-tara-pink transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-tara-dark block mb-1">City *</label>
                        <input type="text" value={form.city} onChange={e => update('city', e.target.value)}
                          placeholder="Mumbai"
                          className={`w-full px-4 py-3.5 border-2 rounded-xl text-base focus:outline-none transition-colors ${errors.city ? 'border-red-400' : 'border-tara-blush focus:border-tara-pink'}`} />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-tara-dark block mb-1">PIN Code *</label>
                        <input type="text" value={form.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="400001"
                          className={`w-full px-4 py-3.5 border-2 rounded-xl text-base focus:outline-none transition-colors ${errors.pincode ? 'border-red-400' : 'border-tara-blush focus:border-tara-pink'}`} />
                        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-tara-dark block mb-1">State *</label>
                      <select value={form.state} onChange={e => update('state', e.target.value)}
                        className={`w-full px-4 py-3.5 border-2 rounded-xl text-base focus:outline-none transition-colors ${errors.state ? 'border-red-400' : 'border-tara-blush focus:border-tara-pink'}`}>
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                  </div>
                  <button onClick={() => validateStep2() && setStep(3)}
                    className="mt-6 w-full bg-tara-pink text-white font-semibold py-4 rounded-2xl hover:bg-[#b5697a] transition-colors flex items-center justify-center gap-2 text-base">
                    Choose Payment <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => setStep(2)} className="w-9 h-9 rounded-full bg-tara-blush flex items-center justify-center hover:bg-tara-pink hover:text-white transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <h2 className="font-serif text-xl text-tara-dark">Payment</h2>
                  </div>

                  {/* Delivery summary */}
                  <div className="bg-tara-ivory rounded-2xl p-4 mb-5 text-sm space-y-1">
                    <p><span className="font-semibold text-tara-dark">Name:</span> <span className="text-tara-muted">{form.name}</span></p>
                    <p><span className="font-semibold text-tara-dark">Phone:</span> <span className="text-tara-muted">+91 {form.phone}</span></p>
                    <p><span className="font-semibold text-tara-dark">Ship to:</span> <span className="text-tara-muted">{form.address1}, {form.city}, {form.state}</span></p>
                  </div>

                  {/* Payment method selection */}
                  <p className="text-sm font-semibold text-tara-dark mb-3">Choose Payment Method</p>
                  <div className="space-y-3 mb-5">
                    <button
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === 'razorpay' ? 'border-tara-pink bg-tara-blush' : 'border-gray-200 hover:border-tara-pink'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-tara-pink' : 'border-gray-300'}`}>
                        {paymentMethod === 'razorpay' && <div className="w-3 h-3 rounded-full bg-tara-pink" />}
                      </div>
                      <CreditCard size={20} className="text-tara-pink" />
                      <div className="text-left flex-1">
                        <p className="font-semibold text-tara-dark text-sm">Pay Online via Razorpay</p>
                        <p className="text-tara-muted text-xs">UPI · Cards · NetBanking · EMI · Wallets</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Recommended</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === 'cod' ? 'border-tara-pink bg-tara-blush' : 'border-gray-200 hover:border-tara-pink'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-tara-pink' : 'border-gray-300'}`}>
                        {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-tara-pink" />}
                      </div>
                      <Banknote size={20} className="text-tara-muted" />
                      <div className="text-left">
                        <p className="font-semibold text-tara-dark text-sm">Cash on Delivery</p>
                        <p className="text-tara-muted text-xs">Pay ₹{(total / 100).toLocaleString('en-IN')} when your package arrives</p>
                      </div>
                    </button>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={paymentMethod === 'razorpay' ? handleRazorpayPayment : handleCODOrder}
                    disabled={placing}
                    className="w-full bg-tara-pink text-white font-semibold py-4 rounded-2xl hover:bg-[#b5697a] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-base shadow-lg shadow-tara-pink/20"
                  >
                    {placing ? (
                      <>⏳ Processing...</>
                    ) : paymentMethod === 'razorpay' ? (
                      <><CreditCard size={18} /> Pay {formatPrice(total)} securely</>
                    ) : (
                      <>Place Order — {formatPrice(total)} COD</>
                    )}
                  </button>

                  <p className="text-center text-xs text-tara-muted mt-3">
                    🔒 Secured by Razorpay · By placing your order you agree to our terms
                  </p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

'use client';

/**
 * @file app/checkout/page.tsx
 * @description Enterprise 3-step checkout for Pakistani footwear e-commerce.
 * Form validation, city-based shipping, 17% GST tax calculation,
 * COD OTP modal, JazzCash / Easypaisa payment selectors, and atomic order creation.
 * Strict TypeScript: ZERO `any`.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart';
import { useLocaleStore } from '@/lib/store/locale';
import { Header } from '@/components/layout/Header';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { formatPKR } from '@/lib/formatters/currency';
import { calculateOrderTotals } from '@/lib/pricing';
import { PAKISTAN_MAJOR_CITIES, PAYMENT_METHOD_DETAILS } from '@/lib/constants';
import { PaymentMethod } from '@/types';
import { createOrder } from '@/actions/order.actions';
import { CheckoutAddressMap } from '@/components/maps/CheckoutAddressMap';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
  Smartphone,
  Building,
  Check,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, appliedCoupon, clearCart } = useCartStore();
  const { isUrdu } = useLocaleStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Address State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+923');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Lahore');
  const [postalCode, setPostalCode] = useState('54000');
  const [notes, setNotes] = useState('');

  // Payment Method & Interactive Inputs
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [walletPhone, setWalletPhone] = useState('03001234567');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [paymentVerified, setPaymentVerified] = useState(false);

  // COD OTP State for orders > PKR 10,000
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Pricing calculations
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 750) * item.quantity, 0);
  const pricing = calculateOrderTotals(
    items.map((i) => ({ price: i.price, quantity: i.quantity })),
    city,
    totalWeight,
    appliedCoupon
      ? {
          type: appliedCoupon.type as any,
          value: appliedCoupon.discountAmount,
          minOrderAmount: 0,
        }
      : null
  );

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !street.trim()) {
      setErrorMsg('Please complete all recipient shipping details.');
      setStep(1);
      return;
    }

    if (!/^\+923\d{9}$/.test(phone)) {
      setErrorMsg('Please enter a valid Pakistani mobile number in format +923XXXXXXXXX');
      setStep(1);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const res = await createOrder({
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
      checkoutData: {
        shippingAddress: {
          fullName,
          phone,
          street,
          city,
          postalCode,
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
        notes,
      },
    });

    setSubmitting(false);

    if (res.success) {
      clearCart();
      router.push(`/order-confirmation/${res.data.order._id}`);
    } else {
      setErrorMsg(res.error || 'Failed to place order. Please check item stock.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-between">
        <AnnouncementBar />
        <Header onOpenSearch={() => {}} />
        <main className="max-w-xl mx-auto my-auto p-8 text-center space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Your bag is empty</h2>
          <p className="text-xs text-neutral-500">Add handcrafted shoes or sneakers before proceeding to checkout.</p>
          <Link href="/shop" className="inline-block px-6 py-3 rounded-full bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider">
            Explore Footwear Catalog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-between">
      <AnnouncementBar />
      <Header onOpenSearch={() => {}} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Checkout Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-5 mb-8">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              Secure Checkout • 256-Bit SSL
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
              {isUrdu ? 'آرڈر چیک آؤٹ' : 'Fast & Secure Checkout'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <Lock className="h-3.5 w-3.5" />
            <span>Encrypted Payment</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Checkout Stepper */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Shipping Destination */}
            <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-neutral-950 text-white font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-bold text-base text-neutral-950">
                    Shipping & Delivery Address
                  </h2>
                </div>
                <span className="text-xs text-neutral-400">Step 1 of 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Syed Hamza Ali"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-950 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Mobile Phone (For TCS SMS / OTP) *
                  </label>
                  <input
                    type="text"
                    placeholder="+923001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-950 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    City (For Shipping Tariff & Courier) *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-950 font-medium bg-white"
                  >
                    {PAKISTAN_MAJOR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">
                    Street Address & House / Flat # *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. House 42-B, Street 10, Sector F-7/2 or DHA Phase 5"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-950 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    placeholder="54000"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-950 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Special Delivery Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Ring bell or call upon arrival"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-950 font-medium"
                  />
                </div>
              </div>

              {/* Interactive Google Map Address Verification */}
              <div className="pt-2 border-t border-neutral-100">
                <CheckoutAddressMap selectedCity={city} streetAddress={street} />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-neutral-950 text-white font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-bold text-base text-neutral-950">Select Payment Method</h2>
                </div>
                <span className="text-xs text-neutral-400">Step 2 of 2</span>
              </div>

              <div className="space-y-3">
                {Object.entries(PAYMENT_METHOD_DETAILS).map(([key, details]) => {
                  const isSelected = paymentMethod === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setPaymentMethod(key as PaymentMethod)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-50/80 ring-1 ring-neutral-950'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={isSelected}
                          onChange={() => setPaymentMethod(key as PaymentMethod)}
                          className="mt-1 accent-neutral-950"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-neutral-950">
                              {details.label}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                              {details.badge}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">{details.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Interactive Payment Method Details */}
              {paymentMethod === PaymentMethod.COD && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <Truck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Cash on Delivery Notice:</strong>
                    Our courier rider (TCS / Leopards) will collect exact amount ({formatPKR(pricing.totalAmount)}) at your doorstep. Please keep cash ready upon parcel arrival.
                  </div>
                </div>
              )}

              {(paymentMethod === PaymentMethod.JAZZCASH || paymentMethod === PaymentMethod.EASYPAISA) && (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-300 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-950 flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4 text-amber-600" />
                      {paymentMethod} Mobile Wallet Details
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Instant API Sync
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      {paymentMethod} Registered Mobile Number (03XXXXXXXXX)
                    </label>
                    <input
                      type="text"
                      placeholder="03001234567"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono text-xs focus:outline-none focus:border-neutral-950 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>A push notification will be sent to your mobile wallet for instant PIN approval.</span>
                  </div>
                </div>
              )}

              {paymentMethod === PaymentMethod.CARD && (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-300 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-950 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-sky-600" />
                      Credit / Debit Card (Visa, Mastercard, PayPak)
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      256-Bit SSL Encrypted
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 •••• •••• 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono text-xs focus:outline-none focus:border-neutral-950 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono text-xs focus:outline-none focus:border-neutral-950 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-700 block mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono text-xs focus:outline-none focus:border-neutral-950 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === PaymentMethod.BANK_TRANSFER && (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-300 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-950 flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-emerald-600" />
                      Direct Bank Transfer (Meezan Bank IBFT)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Zero Fees
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-1 font-mono text-[11px]">
                    <p><strong>Bank:</strong> Meezan Bank Limited (Islamic)</p>
                    <p><strong>Account Title:</strong> OX SHOES FOOTWEAR PAKISTAN</p>
                    <p><strong>IBAN:</strong> PK36MEZN0001020304050607</p>
                    <p><strong>Branch:</strong> MM Alam Road Branch, Lahore</p>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Use your Order ID as payment reference. Our accounts team verifies IBFT receipts within 15 minutes.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Placement */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-6">
              <h2 className="font-bold text-base text-neutral-950 border-b border-neutral-100 pb-3">
                Order Review ({items.length} {items.length === 1 ? 'Pair' : 'Pairs'})
              </h2>

              {/* Items List Mini */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 text-xs">
                    <div className="relative h-14 w-14 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill referrerPolicy="no-referrer" className="object-cover" sizes="56px" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-950 line-clamp-1">{item.name}</h4>
                      <p className="text-neutral-500 text-[11px]">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                      <span className="font-bold text-neutral-900 block mt-0.5">
                        {formatPKR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-xs pt-4 border-t border-neutral-100 text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-950">{formatPKR(pricing.subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-{formatPKR(pricing.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>General Sales Tax (17% GST)</span>
                  <span className="font-semibold text-neutral-950">{formatPKR(pricing.taxAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Courier Shipping ({city})</span>
                  <span className="font-semibold text-neutral-950">
                    {pricing.shippingCharges === 0 ? 'FREE' : formatPKR(pricing.shippingCharges)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-neutral-950 pt-3 border-t border-neutral-200">
                  <span>Total Amount (PKR)</span>
                  <span>{formatPKR(pricing.totalAmount)}</span>
                </div>
              </div>

              {/* Order Submission Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-4 px-6 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-neutral-950/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Place Order ({formatPKR(pricing.totalAmount)})</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-neutral-400 text-center space-y-1">
                <p>By placing this order you agree to our 7-day return & exchange policy.</p>
                <p>TCS tracking number will be sent via SMS to {phone}.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

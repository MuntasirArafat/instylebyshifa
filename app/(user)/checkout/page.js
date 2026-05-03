"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import * as fbq from "@/app/lib/fpixel";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalQty, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "Bangladesh",
  });
  const [shippingArea, setShippingArea] = useState("insideDhaka"); // insideDhaka or outsideDhaka

  const shippingCost = items.length > 0 
    ? (shippingArea === "insideDhaka" ? 80 : 120) 
    : 0;
  const taxes = 0; // 0% tax
  const total = subtotal + shippingCost + taxes;

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      // Small delay to prevent flash during hydration
      const timer = setTimeout(() => router.push("/"), 2000);
      return () => clearTimeout(timer);
    } else {
      fbq.event("InitiateCheckout", {
        content_ids: items.map(i => i.id),
        content_type: "product",
        value: subtotal,
        num_items: totalQty,
        currency: "BDT",
      });
    }
  }, [items, router, subtotal, totalQty]);

  const handlePlaceOrder = async () => {
    if (placing) return;
    setError("");

    if (!contact.firstName.trim() || !contact.phone.trim()) {
      setError("Please enter your first name and phone number.");
      return;
    }
    if (!shippingAddress.address.trim() || !shippingAddress.city.trim()) {
      setError("Please enter your shipping address and city.");
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        customer: {
          ...contact,
          phone: contact.phone.startsWith("+88") ? contact.phone : `+88${contact.phone}`
        },
        shippingAddress,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.id,
          slug: i.slug,
          name: i.name,
          price: i.price,
          originalPrice: i.originalPrice,
          image: i.image,
          size: i.size,
          quantity: i.quantity,
        })),
        subtotal,
        shipping: shippingCost,
        shippingArea,
        tax: taxes,
        total,
        status: "Pending",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to place order. Please try again.");
        return;
      }

      // Wait for 3 seconds to show loader/feedback
      await new Promise((resolve) => setTimeout(resolve, 3000));

      fbq.event("Purchase", {
        content_ids: items.map(i => i.id),
        content_type: "product",
        value: total,
        currency: "BDT",
        num_items: totalQty,
        order_id: data.orderNumber,
      });

      clearCart();
      router.push(`/order-success?orderNumber=${encodeURIComponent(data.orderNumber || "")}`);
    } catch (_e) {
      setError("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Redirecting you to the home page...</p>
        <Link href="/" className="bg-black text-white px-8 py-3 rounded-md font-semibold">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Breadcrumbs */}
      <div className="border-b border-gray-200 bg-white">
        <nav aria-label="Breadcrumb" className="px-4 sm:px-10 lg:px-10 py-3">
          <ol className="flex items-center gap-1.5 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-300">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <button
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-black transition-colors"
              >
                Cart
              </button>
            </li>
            <li className="text-gray-300">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <span className="font-semibold text-gray-900" aria-current="page">Checkout</span>
            </li>
          </ol>
        </nav>
      </div>

      {/* 50-50 split — no max-width, full page width */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">

        {/* ── Left: Form ── */}
        <div className="w-full lg:w-1/2 order-2 lg:order-1 px-6 sm:px-10 lg:px-12 py-8 lg:border-r lg:border-gray-200">

            {/* Section 1: Contact */}
            <div className="mb-8 text-black">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="first-name" className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                    <input
                      type="text"
                      id="first-name"
                      value={contact.firstName}
                      onChange={(e) => setContact((c) => ({ ...c, firstName: e.target.value }))}
                      placeholder="Fatima"
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      id="last-name"
                      value={contact.lastName}
                      onChange={(e) => setContact((c) => ({ ...c, lastName: e.target.value }))}
                      placeholder="Khan"
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    placeholder="fatima@example.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-sm text-gray-500 font-medium">+88</span>
                    <input
                      type="tel"
                      id="phone"
                      value={contact.phone}
                      onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value.replace(/\D/g, '') }))}
                      placeholder="01700 000000"
                      className="w-full border border-gray-300 rounded-md pl-11 pr-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 mb-8" />

            {/* Section 2: Shipping Address */}
            <div className="mb-8 text-black">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress((s) => ({ ...s, address: e.target.value }))}
                  placeholder="Street Address"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition-colors"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress((s) => ({ ...s, city: e.target.value }))}
                    placeholder="City"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition-colors"
                  />
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress((s) => ({ ...s, postalCode: e.target.value }))}
                    placeholder="Postal Code"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition-colors"
                  />
                </div>
                {/* Shipping Area Selection */}
                <div>
                  <label htmlFor="shipping-area" className="block text-xs font-medium text-gray-600 mb-1 mt-1">Shipping Area</label>
                  <select
                    id="shipping-area"
                    value={shippingArea}
                    onChange={(e) => setShippingArea(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition-colors bg-white"
                  >
                    <option value="insideDhaka">Inside Dhaka (৳ 80)</option>
                    <option value="outsideDhaka">Outside Dhaka (৳ 120)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 mb-8" />

            {/* Section 3: Payment */}
            <div className="mb-8 text-black">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {["cod" /* "bkash", "nagad" */].map((method) => (
                  <label key={method} className={`flex items-center gap-4 border rounded-md p-4 cursor-pointer transition-colors ${paymentMethod === method ? "border-black bg-gray-50" : "border-gray-300 hover:border-gray-400"}`}>
                    <input type="radio" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="accent-black w-4 h-4" />
                    <div className="flex items-center gap-3 flex-1 capitalize">
                      <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${method === 'cod' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                        {method === 'bkash' && <img src="/bkash.png" alt="bKash" className="w-9 h-9 object-contain" />}
                        {method === 'nagad' && <img src="/nagad.png" alt="Nagad" className="w-10 h-10 object-contain drop-shadow-sm" />}
                        {method === 'cod' && (
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{method === 'cod' ? 'Cash on Delivery' : method}</p>
                        <p className="text-xs text-gray-500">{method === 'cod' ? 'Pay when you receive' : `Pay securely via ${method}`}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Place Order Button */}
            <div className="mt-2">
              {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-black text-white py-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {placing ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                {placing ? "Processing..." : `Place Order · ৳ ${total.toLocaleString()}`}
              </button>
            </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="w-full lg:w-1/2 order-1 lg:order-2 px-6 sm:px-10 lg:px-12 py-8 ">
          <div className="lg:sticky lg:top-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Your Order ({totalQty} items)</h2>

              <ul className="space-y-4 mb-5 max-h-[50vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <li key={`${item.id}-${item.size}`} className="flex gap-3">
                    <div className="relative shrink-0 w-20 rounded-md overflow-hidden border border-gray-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" style={{ height: "108px" }} />
                      <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-[10px] rounded-full flex items-center justify-center font-medium" style={{ width: "18px", height: "18px" }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 shrink-0">৳ {(item.price * item.quantity).toLocaleString()}</p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-200 pt-4 space-y-2.5 text-sm text-black">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">৳ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">৳ {shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated Tax (0%)</span>
                  <span className="font-medium">৳ {taxes.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>৳ {total.toLocaleString()}</span>
                </div>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}
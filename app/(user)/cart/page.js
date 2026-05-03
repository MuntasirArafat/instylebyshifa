"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, totalQty } = useCart();

  const shipping = items.length > 0 ? 120 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-200">
        <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-1">{totalQty} item{totalQty !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty Cart */
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <svg className="w-20 h-20 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some beautiful pieces to get started.</p>
          <Link href="/" className="bg-black text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* ── Cart Items ── */}
            <div className="flex-1 min-w-0">
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="py-6 flex gap-4 sm:gap-6">
                    {/* Product Image */}
                    <Link href={item.slug ? `/product/${item.slug}` : "#"} className="shrink-0 w-24 h-32 sm:w-32 sm:h-44 rounded-lg overflow-hidden border border-gray-200 block">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <Link href={item.slug ? `/product/${item.slug}` : "#"} className="text-sm sm:text-base font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-2 leading-snug">
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            Size: {item.size}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm sm:text-base font-semibold text-gray-900">৳ {item.price.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 line-through">৳ {item.originalPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                          <button
                            onClick={() => updateQty(item.id, item.size, -1)}
                            className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors text-lg font-light"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-9 h-9 flex items-center justify-center text-sm font-medium border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.size, 1)}
                            className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors text-lg font-light"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total + Remove */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-gray-900 hidden sm:block">
                            ৳ {(item.price * item.quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeItem(item.id, item.size)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="pt-6 border-t border-gray-200">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="font-medium text-gray-900">৳ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-900">৳ {shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-medium text-gray-500 text-xs">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-300 mt-4 pt-4 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>৳ {total.toLocaleString()}</span>
                </div>

                {/* Promo Code */}
                <div className="mt-5">
                  <div className="flex overflow-hidden rounded-md border border-gray-300">
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 text-sm bg-white outline-none placeholder-gray-400"
                    />
                    <button className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
                      Apply
                    </button>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-5 w-full bg-black text-white py-3.5 rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                {/* Trust Badges */}
                <div className="mt-5 space-y-2">
                  {[
                    { icon: "🔒", text: "Secure checkout" },
                    { icon: "🚚", text: "Free delivery over ৳15,000" },
                    { icon: "↩️", text: "Easy 7-day returns" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

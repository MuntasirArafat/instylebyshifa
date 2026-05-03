"use client";
import React, { useEffect, useState } from "react";
import { Drawer } from "vaul";
import Link from "next/link";
import { useCart } from "../context/CartContext";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

function CartContent({ items, updateQty, removeItem, subtotal, onClose }) {
  const shipping = items.length > 0 ? 120 : 0;
  const total = subtotal + shipping;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
          <p className="text-xs text-gray-500 mt-0.5">{totalQty} item{totalQty !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={onClose} aria-label="Close cart" className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm font-semibold text-gray-700 mb-1">Your cart is empty</p>
            <p className="text-xs text-gray-400 mb-6">Add some beautiful pieces to get started.</p>
            <button onClick={onClose} className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-gray-800 transition-colors">
              Continue Shopping
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={`${item.id}-${item.size}`} className="flex gap-4 py-4">
                <Link href={`/product/${item.slug}`} onClick={onClose} className="w-20 h-28 rounded-md overflow-hidden border border-gray-200 shrink-0 block">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{item.name}</p>
                    <div className="flex gap-2 mt-1.5">
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Size: {item.size}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-semibold text-gray-900">৳ {item.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through">৳ {item.originalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                      <button onClick={() => updateQty(item.id, item.size, -1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Decrease">−</button>
                      <span className="w-7 h-7 flex items-center justify-center text-xs font-medium border-x border-gray-300">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.size, 1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Increase">+</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-800">৳ {(item.price * item.quantity).toLocaleString()}</span>
                      <button onClick={() => removeItem(item.id, item.size)} className="text-gray-300 hover:text-red-400 transition-colors" aria-label="Remove">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="shrink-0 border-t border-gray-200 px-5 py-4 bg-white">
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800">৳ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className="font-medium text-gray-800">৳ {shipping.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>৳ {total.toLocaleString()}</span>
            </div>
          </div>
          <Link href="/checkout" onClick={onClose} className="w-full bg-black text-white py-3.5 rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            Checkout
          </Link>
  
        </div>
      )}
    </div>
  );
}

export default function CartDrawer({ open, onClose }) {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const isDesktop = useIsDesktop();

  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()} direction={isDesktop ? "right" : "bottom"}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/25 z-[1000]" />
        <Drawer.Content className={isDesktop
          ? "fixed right-0 top-0 bottom-0 z-[1000] w-[420px] bg-white flex flex-col outline-none shadow-xl"
          : "fixed bottom-0 left-0 right-0 z-[1000] bg-white flex flex-col outline-none rounded-t-2xl max-h-[92dvh]"
        }>
          <Drawer.Title className="sr-only">Shopping Cart</Drawer.Title>
          {!isDesktop && (
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
          )}
          <CartContent items={items} updateQty={updateQty} removeItem={removeItem} subtotal={subtotal} onClose={onClose} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

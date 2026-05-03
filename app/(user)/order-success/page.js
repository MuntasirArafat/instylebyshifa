"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderSuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "—";
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    clearCart();
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b border-gray-200 bg-white">
        <nav aria-label="Breadcrumb" className="px-4 sm:px-10 lg:px-8 py-3">
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
              <Link href="/checkout" className="text-gray-500 hover:text-black transition-colors">
                Checkout
              </Link>
            </li>
            <li className="text-gray-300">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <span className="font-semibold text-gray-900" aria-current="page">Order Confirmed</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md w-full md:border md:p-10 rounded-lg">

        {/* Badge icon — starburst seal shape in black */}
        <div
          className="flex items-center justify-center mb-7"
          style={{
            transform: animate ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(-20deg)",
            opacity: animate ? 1 : 0,
            transition: "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
          }}
        >
          <svg
            width="90"
            height="90"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 12-point starburst seal */}
            <polygon
              points="50,4 60.4,11.4 73,10.2 78.3,21.7 89.8,27 88.6,39.7 96,50 88.6,60.3 89.8,73 78.3,78.3 73,89.8 60.4,88.6 50,96 39.6,88.6 27,89.8 21.7,78.3 10.2,73 11.4,60.3 4,50 11.4,39.7 10.2,27 21.7,21.7 27,10.2 39.6,11.4"
              fill="black"
            />

            {/* White checkmark — drawn in with stroke-dashoffset */}
            <path
              d="M32 51L43 62L68 36"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 60,
                strokeDashoffset: animate ? 0 : 60,
                transition: "stroke-dashoffset 0.5s ease 0.4s",
              }}
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your order has been placed successfully. We'll process and ship it as soon as possible.
        </p>

        {/* Order ID */}
        <div className="border border-gray-200 rounded-lg px-5 py-4 mb-3 bg-gray-50">
          <p className="text-xs text-gray-400 mb-1">Order ID</p>
          <p className="text-base font-semibold text-gray-900 tracking-wide">{orderNumber}</p>
        </div>

        {/* Support note */}
        <p className="text-xs text-gray-400 mb-7 leading-relaxed">
          If you face any issue with your order,{" "}
          <a
            href="mailto:support@instylebyshifa.com"
            className="text-black underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            contact our support team
          </a>
          .
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="w-full bg-black text-white py-3.5 rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Continue Shopping
        </Link>

      </div>   {/* closes card div */}
      </div>   {/* closes min-h wrapper div */}
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gray-500">Loading order...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}

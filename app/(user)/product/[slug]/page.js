"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import Featured from "@/app/component/Featured";

export default function ProductPage({ params }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { slug } = resolvedParams;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addItem, setCartOpen } = useCart();
  const [thumbnail, setThumbnail] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const currentPrice = React.useMemo(() => {
    if (!product) return 0;
    if (!selectedSize || !product.attributes) return product.price;
    const attr = product.attributes.find(a => (a.name || "").toLowerCase() === "size" && a.value === selectedSize);
    return (attr && attr.price && attr.price !== "") ? Number(attr.price) : product.price;
  }, [selectedSize, product]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/products/by-slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setProduct(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setProduct(data);
      } catch (_e) {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold text-gray-700">Product not found.</p>
        <Link href="/" className="text-sm underline text-gray-500 hover:text-black">← Back to home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    // Use the custom price if available for the cart
    const itemToAdd = { ...product, price: currentPrice };
    addItem(itemToAdd, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    const itemToAdd = { ...product, price: currentPrice };
    addItem(itemToAdd, selectedSize, quantity);
    router.push("/checkout");
  };

  return (
    <div className="w-full p-6 lg:px-10">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="pt-4 pb-2">
        <ol className="flex items-center gap-1.5 text-sm flex-wrap">
          <li><Link href="/" className="text-gray-500 hover:text-black transition-colors">Home</Link></li>
          <li className="text-gray-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li><span className="text-gray-500">{product.category}</span></li>
          <li className="text-gray-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li><span className="font-semibold text-gray-900 line-clamp-1">{product.name}</span></li>
        </ol>
      </nav>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 mt-6">

        {/* Images */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:w-20 shrink-0 select-none pb-2 md:pb-0">
            {product.images.map((img, i) => (
              <div
                key={i}
                onClick={() => setThumbnail(i)}
                className={`w-20 md:w-full shrink-0 aspect-[3/4] border rounded-lg overflow-hidden cursor-pointer transition-all ${thumbnail === i ? "border-black ring-1 ring-black" : "border-gray-200 hover:border-gray-400"}`}
              >
                <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover object-top" />
              </div>
            ))}
          </div>

          {/* Main image */}
          <div className="border border-gray-200 rounded-xl overflow-hidden h-[400px] sm:h-[500px] md:h-[600px] flex-1 bg-gray-50">
            <img
              key={thumbnail}
              src={product.images[thumbnail]}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Info */}
        <div className="text-sm flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">{product.name}</h1>

          {/* Price */}
          <div className="mt-5 pb-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <p className="text-3xl font-black tracking-tight text-black">৳ {currentPrice.toLocaleString()}</p>
              {product.originalPrice > currentPrice && (
                <p className="text-lg text-gray-400 line-through font-normal">৳ {product.originalPrice.toLocaleString()}</p>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">Inclusive of all taxes</p>
          </div>

          

          {/* Size */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Select Size</p>
              {sizeError && <p className="text-xs font-medium text-red-500 animate-pulse">Please select a size</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setSizeError(false); }}
                  className={`w-14 h-14 flex items-center justify-center border rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    selectedSize === size
                      ? "bg-black text-white border-black ring-1 ring-black shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-900 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row: Quantity + Add to Cart */}
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Quantity</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit shadow-sm bg-white shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-[56px] flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <span className="w-14 h-[56px] flex items-center justify-center text-base font-semibold border-x border-gray-200 bg-gray-50">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-[56px] flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`h-[56px] flex-1 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                  added
                    ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-900 hover:bg-gray-50 text-gray-900 shadow-sm"
                }`}
              >
                {added ? "✓ Added to Cart!" : "Add to Cart"}
              </button>
            </div>
          </div>

          {/* Buy Now Button */}
          <div className="mt-4">
            <button
              onClick={handleBuyNow}
              className="w-full h-[56px] rounded-lg text-sm font-bold bg-black text-white hover:bg-gray-800 shadow-md transition-all shadow-black/10 uppercase tracking-widest cursor-pointer"
            >
              Buy Now
            </button>
          </div>


          <div className="mt-8 space-y-6">
            {product.description && (
              <div className="border-t pt-6">
                <p className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Product Details</p>
                <div 
                  className="text-gray-600 leading-relaxed product-description"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
            
            {product.highlights && product.highlights.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Product Highlights</p>
                <ul className="list-none space-y-2 text-sm text-gray-600">
                  {product.highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          
        </div>
      </div>

      <div className="my-16 border-t pt-10 border-gray-200">
        <Featured />
      </div>

      <style jsx global>{`
        .product-description ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .product-description ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .product-description strong, .product-description b {
          font-weight: 700;
        }
        .product-description p {
          margin-bottom: 0.75rem;
        }
      `}</style>
    </div>
  );
}
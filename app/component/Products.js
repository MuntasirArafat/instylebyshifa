"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function Products() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/products?limit=20", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setProducts(data.products || []);
      } catch (_e) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className='px-6 sm:px-8 py-10 lg:my-10 lg:mx-8 lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-200'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight'>New Arrivals</h2>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 mt-8 mb-4'>
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-start w-full">
                <div className="w-full aspect-[3/4] mb-3.5">
                  <Skeleton height="100%" borderRadius="0.75rem" />
                </div>
                <div className="w-full mb-1.5">
                  <Skeleton width="90%" height={20} />
                </div>
                <div className="w-full mt-1.5">
                  <Skeleton width="50%" height={24} />
                </div>
              </div>
            ))
          ) : (
            products.map((product) => (
              <Link key={product._id || product.id || product.slug} href={`/product/${product.slug}`} className='cursor-pointer group flex flex-col'>
              <div className='overflow-hidden rounded-xl bg-gray-100 aspect-[3/4]'>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className='w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out'
                />
              </div>
              <div className="mt-3.5 flex flex-col flex-1">
                <p className='text-sm sm:text-base font-medium text-gray-900 line-clamp-2 leading-snug tracking-tight group-hover:text-black transition-colors'>{product.name}</p>
                <div className='mt-1.5 flex items-center gap-2 flex-wrap'>
                  <span className='text-base sm:text-lg font-bold text-black tracking-tight'>৳ {Number(product.price || 0).toLocaleString()}</span>
                  <span className='text-xs sm:text-sm font-normal line-through text-gray-400'>৳ {Number(product.originalPrice || 0).toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))
          )}
        </div>
      </div>
    </>
  )
}

export default Products
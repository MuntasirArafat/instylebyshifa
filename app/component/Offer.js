import React from 'react';
import Link from 'next/link';

function Offer() {
  return (
    <section className="px-6 sm:px-8  mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Curated Collections</h2>
          <p className="text-gray-500 mt-1.5 text-sm lg:text-base">Shop our latest premium selections and exclusive offers</p>
        </div>
        <Link href="/search" className="hidden sm:inline-flex items-center text-sm font-semibold text-black hover:text-gray-600 transition-colors pb-1 border-b-2 border-black hover:border-gray-500">
          View all offers
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Card 1 */}
        <Link href="/search" className="group relative h-[350px] lg:h-[420px] rounded-2xl overflow-hidden block shadow-sm hover:shadow-xl transition-shadow duration-300">
          <img 
            src="/offer1.png" 
            alt="Exclusive Hijab Offer" 
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded w-fit mb-2">New Arrival</span>
            <h3 className="text-xl font-bold text-white mb-1.5">Premium Abayas</h3>
            <span className="inline-flex items-center text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              Shop Now
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </Link>

        {/* Card 2 */}
        <Link href="/search" className="group relative h-[350px] lg:h-[420px] rounded-2xl overflow-hidden block shadow-sm hover:shadow-xl transition-shadow duration-300">
          <img 
            src="offer5.png" 
            alt="Modest Wear" 
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <span className="bg-[#E2146C] text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded w-fit mb-2">Save 30%</span>
            <h3 className="text-xl font-bold text-white mb-1.5">Modest Gowns</h3>
            <span className="inline-flex items-center text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              Shop Now
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </Link>

        {/* Card 3 (Spanning 2 columns) */}
        <Link href="/search" className="group relative h-[350px] lg:h-[420px] rounded-2xl overflow-hidden block md:col-span-2 lg:col-span-2 shadow-sm hover:shadow-xl transition-shadow duration-300">
          <img 
            src="offer4.png" 
            alt="Eid Collection" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300"></div>
          <div className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-end">
            <span className="bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full w-fit mb-3">Limited Edition</span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 max-w-sm leading-tight">Exclusive Eid Collection 2026</h3>
            <p className="text-gray-300 mb-6 max-w-md hidden sm:block text-sm leading-relaxed">
              Discover elegant, hand-crafted pieces designed specifically for your special occasions and festive celebrations.
            </p>
            <span className="inline-flex items-center text-sm font-semibold text-black bg-white hover:bg-gray-100 px-6 py-3 rounded-full transition-colors w-fit">
              Explore Collection
            </span>
          </div>
        </Link>

      </div>
      
      {/* Mobile view all link */}
      <div className="mt-8 flex justify-center sm:hidden">
        <Link href="/search" className="inline-flex items-center text-sm font-semibold text-black px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white transition-colors">
          View all offers
        </Link>
      </div>
    </section>
  );
}

export default Offer;
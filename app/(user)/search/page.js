"use client";
import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useQuery } from "@tanstack/react-query";
import * as fbq from "@/app/lib/fpixel";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialPage = parseInt(searchParams.get("page") || "1");

  // Filter states
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [draftCategory, setDraftCategory] = useState(initialCategory);
  const [draftMinPrice, setDraftMinPrice] = useState("");
  const [draftMaxPrice, setDraftMaxPrice] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync draft state with URL params
  React.useEffect(() => {
    setDraftQuery(initialQuery);
    setDraftCategory(initialCategory);

    if (initialQuery) {
      fbq.event("Search", {
        search_string: initialQuery,
      });
    }
  }, [initialQuery, initialCategory]);

  // Categories query
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await fetch('/api/categories?limit=1000');
      if (!res.ok) return { categories: [] };
      return res.json();
    }
  });

  // Products query
  const { data: productsData, isLoading: loadingProducts, isPlaceholderData } = useQuery({
    queryKey: ['search-products', initialQuery, initialCategory, initialPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (initialQuery) params.set("search", initialQuery);
      if (initialCategory !== "All") params.set("category", initialCategory);
      params.set("page", initialPage.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) return { products: [], pagination: {} };
      return res.json();
    }
  });

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || {};
  const categoriesList = ["All", ...(categoriesData?.categories || []).map(c => c.name)];

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (draftQuery) params.set("q", draftQuery); else params.delete("q");
    if (draftCategory !== "All") params.set("category", draftCategory); else params.delete("category");
    params.set("page", "1"); // Reset to page 1 on new filter
    
    setAppliedMinPrice(draftMinPrice);
    setAppliedMaxPrice(draftMaxPrice);
    
    router.push(`/search?${params.toString()}`);
    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    setDraftQuery("");
    setDraftCategory("All");
    setDraftMinPrice("");
    setDraftMaxPrice("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    router.push("/search");
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Price/Sort filtering still handled in memory for UX if needed, 
  // but for now let's just use what comes from server
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (appliedMinPrice) list = list.filter(p => p.price >= parseInt(appliedMinPrice));
    if (appliedMaxPrice) list = list.filter(p => p.price <= parseInt(appliedMaxPrice));
    
    if (sort === "low_to_high") list.sort((a, b) => a.price - b.price);
    else if (sort === "high_to_low") list.sort((a, b) => b.price - a.price);
    
    return list;
  }, [products, appliedMinPrice, appliedMaxPrice, sort]);

  return (
    <div className="w-full mx-auto px-6 sm:px-8 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1.5 text-sm flex-wrap">
          <li><Link href="/" className="text-gray-500 hover:text-black transition-colors">Home</Link></li>
          <li className="text-gray-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li className={`${!initialQuery ? 'text-black font-medium' : 'text-gray-500 hover:text-black transition-colors cursor-pointer'}`} onClick={clearFilters}>
            Search
          </li>
          {initialQuery && (
            <>
              <li className="text-gray-300">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-black font-medium truncate max-w-[150px] sm:max-w-xs">&quot;{initialQuery}&quot;</li>
            </>
          )}
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Filters Sidebar */}
        <div 
          className={`fixed inset-0 z-50 bg-black/50 md:bg-transparent md:static md:block ${mobileFiltersOpen ? "block" : "hidden"}`} 
          onClick={() => setMobileFiltersOpen(false)}
        >
          <aside 
            className="fixed md:static inset-x-0 bottom-0 top-auto w-full md:w-64 bg-white md:bg-transparent px-6 pt-5 pb-8 md:p-0 rounded-t-3xl md:rounded-none max-h-[85vh] h-auto overflow-y-auto md:h-full md:overflow-visible shrink-0 space-y-6 md:space-y-8 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] md:shadow-none animate-in slide-in-from-bottom duration-300 md:animate-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bottom Sheet Handle */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto md:hidden mb-2"></div>

            <div className="flex flex-row items-center justify-between md:hidden mb-2">
              <h2 className="text-xl font-bold">Filters</h2>
              <button aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black -mr-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search override */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Search</h3>
              <input 
                type="text" 
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Category</h3>
              <div className="space-y-2">
                {categoriesList.map(c => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${draftCategory === c ? 'bg-black border-black text-white' : 'border-gray-300 group-hover:border-black'}`}>
                      {draftCategory === c && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-sm text-gray-700">{c}</span>
                    <input type="radio" name="category" value={c} checked={draftCategory === c} onChange={() => setDraftCategory(c)} className="hidden" />
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider">Price</h3>
                <span className="text-xs font-bold text-gray-500">
                  ৳{draftMinPrice || 0} - ৳{draftMaxPrice || 15000}
                </span>
              </div>

              <div className="relative h-5 flex items-center mb-6 mt-2">
                {/* Background Track */}
                <div className="absolute w-full h-1.5 bg-gray-200 rounded-full"></div>
                {/* Active Highlight Track */}
                <div 
                  className="absolute h-1.5 bg-black rounded-full" 
                  style={{
                    left: `${((draftMinPrice || 0) / 15000) * 100}%`,
                    right: `${100 - ((draftMaxPrice || 15000) / 15000) * 100}%`
                  }}
                />
                <input 
                  type="range" 
                  min="0" 
                  max="15000" 
                  step="100"
                  value={draftMinPrice || 0}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), (draftMaxPrice || 15000) - 100);
                    setDraftMinPrice(val ? val.toString() : "");
                  }}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab"
                />
                <input 
                  type="range" 
                  min="0" 
                  max="15000" 
                  step="100"
                  value={draftMaxPrice || 15000}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), (draftMinPrice || 0) + 100);
                    setDraftMaxPrice(val < 15000 ? val.toString() : "");
                  }}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">৳</span>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={draftMinPrice}
                    onChange={(e) => setDraftMinPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
                <span className="text-gray-400">-</span>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">৳</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={draftMaxPrice}
                    onChange={(e) => setDraftMaxPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
            </div>
            
            {/* View Results Button */}
            <div className="pt-4 pb-2">
               <button 
                 onClick={applyFilters} 
                 className="w-full py-4 md:py-3 bg-black text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-3"
               >
                 Apply Filters
               </button>
            </div>
          </aside>
        </div>

        {/* Desktop Divider */}
        <div className="hidden md:block w-px bg-gray-200 shrink-0"></div>

        {/* Results Grid */}
        <div className="flex-1 w-full min-w-0">
          {/* Header & Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-black">{pagination.total || 0}</span> results
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              
              <button 
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-bold text-gray-800 hover:border-black bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"/></svg>
                FILTERS
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden lg:block">Sort by:</span>
                <select 
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none hover:border-black cursor-pointer bg-white transition-colors"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="low_to_high">Price: Low to High</option>
                  <option value="high_to_low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-start w-full">
                  <div className="w-full aspect-[3/4] mb-4">
                    <Skeleton height="100%" borderRadius="0.75rem" />
                  </div>
                  <div className="w-full mb-2">
                    <Skeleton width="80%" height={24} />
                  </div>
                  <div className="w-full">
                    <Skeleton width="40%" height={20} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="min-h-[60vh] w-full flex flex-col items-center justify-center text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300 mb-4">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">No products found</h2>
              <p className="text-gray-500">Try adjusting your filters or searching for something else.</p>
              <button 
                onClick={clearFilters}
                className="mt-6 px-8 py-3 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {filteredProducts.map((product) => (
                  <Link key={product._id} href={`/product/${product.slug}`} className="group flex flex-col items-start text-left cursor-pointer w-full">
                    <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-4 relative w-full">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                      {product.originalPrice > product.price && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                          Sale
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-1 w-full">{product.name}</h3>
                    <div className="mt-1 flex items-center justify-start gap-2 w-full">
                      <span className="text-sm font-bold text-black animate-fade-in-up">৳ {product.price.toLocaleString()}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through">৳ {product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-3">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="p-3 border border-gray-200 rounded-xl hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-11 h-11 rounded-xl text-sm font-bold transition-all ${pagination.page === i + 1 ? "bg-black text-white shadow-lg shadow-black/20" : "bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="p-3 border border-gray-200 rounded-xl hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="w-full mx-auto px-6 sm:px-8 py-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-gray-200 rounded mb-8"></div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Skeleton */}
        <div className="hidden md:block w-64 shrink-0 space-y-8">
          <div className="h-20 bg-gray-100 rounded-xl"></div>
          <div className="h-40 bg-gray-100 rounded-xl"></div>
          <div className="h-32 bg-gray-100 rounded-xl"></div>
        </div>

        {/* Desktop Divider */}
        <div className="hidden md:block w-px bg-gray-100 shrink-0"></div>

        {/* Results Skeleton */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <div className="h-4 w-32 bg-gray-100 rounded"></div>
            <div className="h-10 w-40 bg-gray-100 rounded-lg"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-start w-full">
                <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl mb-4"></div>
                <div className="h-5 w-full bg-gray-100 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}


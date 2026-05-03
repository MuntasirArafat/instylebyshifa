"use client";
import React, { useState, useEffect,useMemo } from "react";
import CartDrawer from "./CartDrawer";
import { useCart } from "../context/CartContext";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [desktopShopOpen, setDesktopShopOpen] = useState(false);
  const { totalQty, cartOpen, setCartOpen } = useCart();
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState([]);

  const { data } = useQuery({
    queryKey: ['categories-menu'],
    queryFn: async () => {
      const res = await fetch('/api/categories?limit=1000'); // Get all for menu
      if (!res.ok) return { categories: [] };
      return res.json();
    }
  });

  const categories = data?.categories || [];

  const menuCategories = useMemo(() => {
    // 1. Get all root categories marked for menu
    const roots = categories.filter(c => !c.parentId && c.showInMenu);
    
    // 2. Attach children to each root
    return roots.map(root => ({
      ...root,
      children: categories.filter(c => c.parentId === root._id)
    }));
  }, [categories]);

  useEffect(() => {
    try {
      setRecentSearches(JSON.parse(localStorage.getItem("_recent_searches") || "[]"));
    } catch(e) {}
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      const updatedHistory = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
      setRecentSearches(updatedHistory);
      try {
        localStorage.setItem("_recent_searches", JSON.stringify(updatedHistory));
      } catch(e) {}
      
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Hide the bar when scrolled past 40 pixels
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <header className="sticky top-0 z-[990] w-full shadow-sm">
        {/* Announcement bar */}
        <div 
          className={`w-full font-medium text-white text-sm text-center  bg-black overflow-hidden transition-all duration-300 ease-in-out ${
            isScrolled ? "h-0 opacity-0" : "h-10 opacity-100"
          }`}
        >
          <div className="flex  items-center justify-center h-full">
            <p>
              ✨ Eid Special — Get 20% off on all Abaya &amp; Kaftan collections.{" "}
              <span className="underline cursor-pointer">Shop Now</span>
            </p>
          </div>
        </div>

        <nav className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-gray-200 bg-white relative transition-all w-full">
          
          {/* Mobile Menu Toggle (LEFT) */}
          <div className="flex flex-1 sm:hidden justify-start">
            <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" className="p-1 -ml-1">
              <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
                <rect width="21" height="1.5" rx=".75" fill="black" />
                <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="black" />
                <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="black" />
              </svg>
            </button>
          </div>

          {/* Logo (CENTER on mobile, LEFT on desktop) */}
          <div className="flex flex-1 sm:flex-none justify-center sm:justify-start">
            <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="text-black">InstylebyShifa.</span>
            </Link>
          </div>

          {/* Desktop Menu (Hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-8 justify-center flex-1 px-8">
            <Link href="/" className="text-sm font-medium hover:text-gray-600 transition-colors">Home</Link>
            
            {menuCategories.map(cat => {
              if (cat.children.length === 0) {
                return (
                  <Link 
                    key={cat._id}
                    href={`/search?category=${encodeURIComponent(cat.name)}`} 
                    className="text-sm font-medium hover:text-gray-600 transition-colors capitalize"
                  >
                    {cat.name}
                  </Link>
                );
              }

              return (
                <div 
                  key={cat._id}
                  className="relative group/nav"
                >
                  <Link 
                    href={`/search?category=${encodeURIComponent(cat.name)}`}
                    className="text-sm font-medium hover:text-gray-600 transition-colors flex items-center gap-1 capitalize py-4"
                  >
                    {cat.name}
                    <svg className="w-3.5 h-3.5 transition-transform group-hover/nav:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </Link>
                  <div className="absolute top-[80%] left-0 pt-4 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-[1000]">
                    <div className="bg-white border border-gray-100 shadow-xl rounded-xl py-2 min-w-[12rem] flex flex-col">
                      {cat.children.map(child => (
                        <Link 
                          key={child._id}
                          href={`/search?category=${encodeURIComponent(child.name)}`} 
                          className="px-5 py-2.5 text-sm hover:bg-gray-50 text-gray-700 hover:text-black capitalize"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions Area (RIGHT) */}
          <div className="flex flex-1 sm:flex-none justify-end items-center gap-4 sm:gap-6">
            
            {/* Search Icon */}
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="relative cursor-pointer hover:opacity-70 transition-opacity p-1"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M10.836 10.615 15 14.695" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Cart Icon */}
            <button
              id="cart-btn"
              aria-label="Open cart"
              onClick={() => setCartOpen(true)}
              className="relative cursor-pointer hover:opacity-70 transition-opacity p-1 -mr-1 sm:mr-0"
            >
              <svg width="20" height="18" viewBox="0 0 14 14" fill="none">
                <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {totalQty > 0 && (
                <span className="absolute -top-1.5 -right-2 text-[10px] sm:text-xs font-bold text-white bg-black w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] rounded-full flex items-center justify-center leading-none">
                  {totalQty}
                </span>
              )}
            </button>
          </div>

          {/* Mobile dropdown */}
          <div className={`${menuOpen ? "flex" : "hidden"} absolute top-[100%] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden z-30 border-t border-gray-100`}>
            <Link href="/" onClick={() => setMenuOpen(false)} className="block hover:text-gray-600 transition-colors w-full p-2 text-base font-medium">Home</Link>
            
            {menuCategories.map(cat => (
              <div key={cat._id} className="w-full">
                {cat.children.length > 0 ? (
                  <>
                    <p className="block text-gray-400 font-semibold text-xs tracking-widest uppercase p-2 pt-4">{cat.name}</p>
                    <Link 
                      href={`/search?category=${encodeURIComponent(cat.name)}`} 
                      onClick={() => setMenuOpen(false)} 
                      className="block hover:text-gray-600 transition-colors w-full p-2 pl-4 text-sm capitalize"
                    >
                      All {cat.name}
                    </Link>
                    {cat.children.map(child => (
                      <Link 
                        key={child._id}
                        href={`/search?category=${encodeURIComponent(child.name)}`} 
                        onClick={() => setMenuOpen(false)} 
                        className="block hover:text-gray-600 transition-colors w-full p-2 pl-4 text-sm capitalize"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link 
                    href={`/search?category=${encodeURIComponent(cat.name)}`} 
                    onClick={() => setMenuOpen(false)} 
                    className="block hover:text-gray-600 transition-colors w-full p-2 text-base font-medium capitalize"
                  >
                    {cat.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-gray-200 px-5 py-4">
              <svg width="24" height="24" viewBox="0 0 16 16" fill="none" className="mr-3 shrink-0">
                <path d="M10.836 10.615 15 14.695" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, categories..." 
                className="w-full text-lg outline-none bg-transparent placeholder-gray-400 text-gray-900"
                autoFocus
              />
              <button 
                type="button"
                onClick={() => setSearchOpen(false)}
                className="ml-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors shrink-0"
                aria-label="Close search"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
            <div className={`p-8 bg-gray-50 h-[300px] flex ${recentSearches.length > 0 ? "flex-col items-start justify-start" : "items-center justify-center"}`}>
              {recentSearches.length > 0 ? (
                <>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent Searches</h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const updatedHistory = [term, ...recentSearches.filter(q => q !== term)].slice(0, 5);
                          setRecentSearches(updatedHistory);
                          try { localStorage.setItem("_recent_searches", JSON.stringify(updatedHistory)); } catch(e) {}
                          router.push(`/search?q=${encodeURIComponent(term)}`);
                          setSearchOpen(false);
                        }}
                        className="px-4 py-2 bg-white border border-gray-200 hover:border-black text-gray-700 text-sm rounded-full transition-colors flex items-center gap-2"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {term}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Hit Enter to view results...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
"use client";
import React, { useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import DeleteModal from '@/app/component/admin/DeleteModal'

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { page, search, category: appliedCategory }],
    queryFn: async () => {
      const qs = new URLSearchParams({
        page: String(page),
        limit: '10',
        search,
        category: appliedCategory
      });
      const res = await fetch(`/api/products?${qs.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  const applyFilters = (e) => {
    e?.preventDefault();
    setSearch(searchInput);
    setAppliedCategory(categoryInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategoryInput("");
    setAppliedCategory("");
    setPage(1);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct?._id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted successfully");
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      } else {
        toast.error("Failed to delete product");
      }
    } catch (_e) {
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6"> 
      <form onSubmit={applyFilters} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-full max-w-md flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Category..."
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm text-sm font-medium flex-1 lg:flex-none min-w-[140px]"
            />
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex-1 lg:flex-none">
              Apply Filters
            </button>
            <Link href="/admin/products/add" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg flex items-center gap-2 flex-1 lg:flex-none justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              New Product
            </Link>
          </div>
        </div>
        
        {search || appliedCategory ? (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button 
              type="button"
              onClick={clearFilters}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest ml-auto"
            >
              Clear All Filters
            </button>
          </div>
        ) : null}
      </form>
   
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-4 text-nowrap">Product</th>
                <th className="px-6 py-4 text-nowrap">Category</th>
                <th className="px-6 py-4 text-nowrap">Price</th>
                <th className="px-6 py-4 text-nowrap">Stock</th>
                <th className="px-6 py-4 text-nowrap">Status</th>
                <th className="px-6 py-4 text-right text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan={6}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan={6}>
                    No products found.
                  </td>
                </tr>
              ) : (
              products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50 transition-colors text-sm font-medium">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                        <img src={p?.images?.[0] || "/placeholder-product.png"} alt="product" className="w-full h-full object-cover" onError={(e) => e.target.src = "/placeholder-product.png"} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{p.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900">৳ {Number(p.price || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600">{Number(p.stock || 0)} Units</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${p.status === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status || "In Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <Link href={`/admin/products/edit/${p._id}`} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">Edit</Link>
                    <button 
                      onClick={() => handleDeleteClick({ ...p, type: 'Product' })}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="text-gray-900">{products.length}</span> of <span className="text-gray-900">{pagination.total}</span> products
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-xs font-bold text-gray-600 px-2">
              Page {page} of {pagination.totalPages}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || isLoading}
              className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedProduct?.name}
        itemType={selectedProduct?.type}
        isProcessing={deleting}
      />
    </div>
  )
}

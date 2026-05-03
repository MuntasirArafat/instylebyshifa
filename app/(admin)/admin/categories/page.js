"use client";
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import DeleteModal from '@/app/component/admin/DeleteModal'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

export default function AdminCategories() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-categories', page, search],
    queryFn: async () => {
      const res = await fetch(`/api/categories?page=${page}&limit=10&search=${search}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
    keepPreviousData: true
  });

  const categories = data?.categories || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleDeleteClick = (category) => {
    setSelectedCategoryId(category._id?.toString() || "");
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategoryId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${selectedCategoryId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Category deleted successfully");
        refetch();
      } else {
        toast.error("Failed to delete category");
      }
    } catch (_e) {
      toast.error("An error occurred while deleting");
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      setSelectedCategoryId("");
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-600 transition-colors shadow-sm"
            />
          </div>
          <button type="submit" className="bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
            Search
          </button>
        </form>

        <Link href="/admin/categories/add" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 w-full sm:w-auto justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Category
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-sm text-gray-500 px-1">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-sm text-gray-500 px-1">No categories found. {search && "Try a different search."}</div>
        ) : (
          categories.map((cat) => (
            <div key={cat._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between group hover:border-indigo-200 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
                  {cat.showInMenu && (
                    <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">In Menu</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500 font-medium">{cat.slug}</p>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  {cat.parentId ? (
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">
                      Sub-category
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Root Category</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Link href={`/admin/categories/edit/${cat._id}`} className="p-2 hover:bg-indigo-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all" title="Edit">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </Link>
                <button
                  onClick={() => handleDeleteClick({ ...cat, type: 'Category' })}
                  className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 font-medium">Showing <span className="text-gray-900">{categories.length}</span> of {total} categories</p>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'hover:bg-white border border-transparent hover:border-gray-200 text-gray-600'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedCategory?.name}
        itemType={selectedCategory?.type}
        isProcessing={deleting}
      />
    </div>
  )
}

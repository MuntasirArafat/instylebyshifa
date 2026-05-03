"use client";
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import DeleteModal from '@/app/component/admin/DeleteModal'
import { toast } from 'react-hot-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [statusInput, setStatusInput] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [fromDateInput, setFromDateInput] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [toDateInput, setToDateInput] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', { page, status: appliedStatus, search, fromDate: appliedFromDate, toDate: appliedToDate }],
    queryFn: async () => {
      const qs = new URLSearchParams({
        page: String(page),
        limit: '10',
        status: appliedStatus,
        search,
        fromDate: appliedFromDate,
        toDate: appliedToDate
      });
      const res = await fetch(`/api/orders?${qs.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    }
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  // Handle Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length && orders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o._id));
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} orders?`)) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/orders/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        toast.success("Orders deleted successfully");
        setSelectedIds([]);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      } else {
        toast.error("Failed to delete orders");
      }
    } catch (err) {
      toast.error("Error occurred during bulk delete");
    } finally {
      setDeleting(false);
    }
  };

  const applyFilters = (e) => {
    e?.preventDefault();
    setSearch(searchInput);
    setAppliedStatus(statusInput);
    setAppliedFromDate(fromDateInput);
    setAppliedToDate(toDateInput);
    setPage(1);
    setSelectedIds([]);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusInput("");
    setAppliedStatus("");
    setFromDateInput("");
    setAppliedFromDate("");
    setToDateInput("");
    setAppliedToDate("");
    setPage(1);
    setSelectedIds([]);
  };

  const handleDeleteClick = (order) => {
    const cleanId = order._id?.toString?.().trim() ?? '';
    setSelectedOrderId(cleanId);
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrderId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrderId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Order deleted successfully");
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        setSelectedIds(prev => prev.filter(i => i !== selectedOrderId));
      } else {
        toast.error("Failed to delete order");
      }
    } catch (_e) {
      toast.error("An error occurred while deleting");
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
      setSelectedOrderId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">Manage Orders</h2>
        {selectedIds.length > 0 && (
          <button 
            onClick={handleBulkDelete}
            disabled={deleting}
            className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete {selectedIds.length} Selected
          </button>
        )}
      </div>

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
                placeholder="Order ID or Customer Name..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value === "All" ? "" : e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm text-sm font-medium flex-1 lg:flex-none min-w-[140px]"
            >
              <option value="">All Status</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex-1 lg:flex-none">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 mt-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">From</label>
            <input 
              type="date" 
              value={fromDateInput}
              onChange={(e) => setFromDateInput(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs font-semibold"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To</label>
            <input 
              type="date" 
              value={toDateInput}
              onChange={(e) => setToDateInput(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs font-semibold"
            />
          </div>
          <button 
            type="button"
            onClick={clearFilters}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest ml-auto"
          >
            Clear Filters
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll}
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-nowrap">Order ID</th>
                <th className="px-6 py-4 text-nowrap">Customer</th>
                <th className="px-6 py-4 text-nowrap">Date</th>
                <th className="px-6 py-4 text-nowrap">Total</th>
                <th className="px-6 py-4 text-nowrap">Status</th>
                <th className="px-6 py-4 text-right text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan={7}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan={7}>No orders found.</td>
                </tr>
              ) : (
                orders.map((o) => {
                  const name = `${o?.customer?.firstName || ""} ${o?.customer?.lastName || ""}`.trim() || "Customer";
                  const created = o?.createdAt ? new Date(o.createdAt) : null;
                  const isSelected = selectedIds.includes(o._id);
                  return (
                    <tr key={o._id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(o._id)}
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{o.orderNumber || `#${o._id}`}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                            <img 
                              src={o.items?.[0]?.image || "/placeholder-product.png"} 
                              alt="product" 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = "/placeholder-product.png"; }}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{name}</div>
                            <div className="text-[11px] text-gray-400 font-medium">{o?.customer?.email || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm font-medium">{created ? created.toLocaleString() : "-"}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">৳ {Number(o?.amounts?.total || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{o.status || "Pending"}</span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <Link href={`/admin/orders/edit/${o._id}`} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">Details</Link>
                        <button
                          onClick={() => handleDeleteClick({ ...o, name: o.orderNumber || `#${o._id}`, type: 'Order' })}
                          disabled={deleting}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="text-gray-900">{orders.length}</span> of <span className="text-gray-900">{pagination.total}</span> orders
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
        itemName={selectedOrder?.name}
        itemType={selectedOrder?.type}
        isProcessing={deleting}
      />
    </div>
  )
}

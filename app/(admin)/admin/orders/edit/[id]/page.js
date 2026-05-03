"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function OrderDetailsPage() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [internalNote, setInternalNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load order");
        const data = await res.json();
        if (cancelled) return;
        setOrder(data);
        setStatus(data?.status || "Pending");
        setInternalNote(data?.internalNote || "");
      } catch (e2) {
        if (!cancelled) setError(e2?.message || "Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const orderItems = useMemo(() => {
    return Array.isArray(order?.items) ? order.items : [];
  }, [order]);

  const subtotal = Number(order?.amounts?.subtotal ?? orderItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.qty || item.quantity || 0)), 0));
  const delivery = Number(order?.amounts?.shipping ?? 0);
  const total = Number(order?.amounts?.total ?? subtotal + delivery);

  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNote }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update order");
      }
      const updated = await res.json().catch(() => null);
      if (updated) {
        setOrder(updated);
        setStatus(updated.status || "Pending");
        setInternalNote(updated.internalNote || "");
        toast.success("Order updated successfully!");
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['sidebar-order-count'] });
      }
    } catch (e2) {
      setError(e2?.message || "Failed to update order");
      toast.error(e2?.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order?.orderNumber ? `Order ${order.orderNumber}` : `Order #${id}`}</h1>
          <p className="text-sm text-gray-500">
            {order?.createdAt ? `Placed on ${new Date(order.createdAt).toLocaleString()}` : (loading ? "Loading..." : "—")}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items and Customer Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-6 text-sm text-gray-500">Loading items...</div>
              ) : orderItems.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">No items.</div>
              ) : orderItems.map((item, idx) => (
                <div key={item._id || item.id || idx} className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                    <img 
                      src={item.image || "/placeholder-product.png"} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "/placeholder-product.png"; }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name || "Item"}</h3>
                    <p className="text-sm text-gray-500">
                      {item.size ? `Size: ${item.size} • ` : ""}
                      Qty: {Number(item.qty || item.quantity || 0)} × ৳ {Number(item.price || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">৳ {Number(item.price || 0) * Number(item.qty || item.quantity || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 p-6 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>৳ {subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping Fee</span>
                <span>৳ {delivery}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span>৳ {total}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4">Customer Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Name</p>
                  <p className="text-sm font-medium">
                    {`${order?.customer?.firstName || ""} ${order?.customer?.lastName || ""}`.trim() || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                  <p className="text-sm font-medium">{order?.customer?.email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Phone</p>
                  <p className="text-sm font-medium">{order?.customer?.phone || "-"}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4">Shipping Address</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {order?.shippingAddress?.address || "-"}<br />
                {order?.shippingAddress?.city || "-"} {order?.shippingAddress?.postalCode ? `- ${order.shippingAddress.postalCode}` : ""}<br />
                {order?.shippingAddress?.country || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4">Order Status</h2>
            <div className="space-y-4">
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading || saving}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 transition-colors bg-white text-sm font-medium"
              >
                <option>Pending</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
              <button
                disabled={loading || saving}
                onClick={handleUpdate}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-70"
              >
                {saving ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4">Internal Notes</h2>
            <textarea 
              rows="3" 
              placeholder="Add a private note for staff..."
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              disabled={loading || saving}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-600 transition-colors mb-3"
            ></textarea>
            <button
              disabled={loading || saving}
              onClick={handleUpdate}
              className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

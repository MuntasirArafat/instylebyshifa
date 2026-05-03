"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function EditCategoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) return { categories: [] };
      return res.json();
    }
  });
  const categories = data?.categories || [];
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    showInMenu: false,
    parentId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/categories/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load category");
        const data = await res.json();
        if (cancelled) return;
        setFormData({
          name: data?.name || "",
          description: data?.description || "",
          slug: data?.slug || "",
          showInMenu: data?.showInMenu || false,
          parentId: data?.parentId || "",
        });
      } catch (e2) {
        if (!cancelled) setError(e2?.message || "Failed to load category");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update category");
      }
      toast.success("Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['categories-menu'] });
      router.push("/admin/categories");
    } catch (e2) {
      const msg = e2?.message || "Failed to update category";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 ">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Category Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea 
              rows="4" 
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 transition-colors"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Parent Category (Optional)</label>
              <select 
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 transition-colors bg-white"
              >
                <option value="">None (Top Level)</option>
                {categories.filter(c => c._id !== id).map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-8">
              <input 
                type="checkbox" 
                id="showInMenu"
                name="showInMenu"
                checked={formData.showInMenu}
                onChange={handleChange}
                disabled={loading}
                className="w-5 h-5 accent-indigo-600 rounded border-gray-300 transition-all cursor-pointer"
              />
              <label htmlFor="showInMenu" className="text-sm font-bold text-gray-700 uppercase tracking-wider cursor-pointer">Show in Menu</label>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button disabled={saving || loading} type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-70">
              {saving ? "Updating..." : "Update Category"}
            </button>
            <Link href="/admin/categories" className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-bold uppercase tracking-widest text-center hover:bg-gray-50 transition-all">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

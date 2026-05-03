"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Plus, X, Upload, Trash2, ChevronDown, DollarSign, Save } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Editor from '@/app/component/admin/Editor';

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function EditProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    description: '',
    stock: '',
    description: '',
    status: 'In Stock',
    isFeatured: false
  });

  const [images, setImages] = useState([]); // [{ src, file? }]
  
  const [attributes, setAttributes] = useState([
    { name: 'Size', value: 'L', price: '' },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await fetch('/api/categories?limit=1000');
      if (!res.ok) return { categories: [] };
      return res.json();
    }
  });
  const categories = data?.categories || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: '', value: '', price: '' }]);
  };

  const removeAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      src: URL.createObjectURL(file),
      file,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const img = prev[index];
      if (img?.file && img?.src?.startsWith?.("blob:")) {
        try {
          URL.revokeObjectURL(img.src);
        } catch (_e) {}
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadToBunny = async (file) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload/bunny", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Image upload failed");
    if (!data?.url) throw new Error("Image upload failed");
    return data.url;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        if (cancelled) return;
        setFormData({
          name: data?.name || "",
          price: String(data?.price ?? ""),
          originalPrice: String(data?.originalPrice ?? ""),
          category: data?.category || "Abaya",
          stock: String(data?.stock ?? ""),
          description: data?.description || "",
          status: data?.status || "In Stock",
          isFeatured: Boolean(data?.isFeatured),
        });
        const urls = Array.isArray(data?.images) ? data.images : [];
        setImages(urls.map((u) => ({ src: u })));
        setAttributes(Array.isArray(data?.attributes) ? data.attributes : []);
      } catch (e2) {
        if (!cancelled) setError(e2?.message || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const uploadedUrls = await Promise.all(
        images.map(async (img) => {
          if (img?.file) return await uploadToBunny(img.file);
          return img?.src;
        }),
      );

      const payload = {
        ...formData,
        slug: slugify(formData.name),
        price: Number(formData.price || 0),
        originalPrice: Number(formData.originalPrice || 0),
        stock: Number(formData.stock || 0),
        images: uploadedUrls.filter(Boolean),
        attributes,
        sizes: Array.from(new Set(attributes.filter(a => (a.name || "").toLowerCase() === "size").map(a => a.value).filter(Boolean))),
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save");
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      router.push("/admin/products");
    } catch (e2) {
      setError(e2?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-10">
        <form className="space-y-10" onSubmit={handleSave}>
          {error && (
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}
          {/* Basic Info */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Luxury Velvet Abaya" 
                  className="w-full border border-gray-200 bg-gray-50/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
                <div className="relative">
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium appearance-none"
                  >
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))
                    ) : (
                      <option>Loading...</option>
                    )}
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Base Price (৳)</label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="4500" 
                  className="w-full border border-gray-200 bg-gray-50/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Original Price (৳)</label>
                <input 
                  type="number" 
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="5200" 
                  className="w-full border border-gray-200 bg-gray-50/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Stock (units)</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="15"
                  className="w-full border border-gray-200 bg-gray-50/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                />
              </div>
              <div className="flex items-center gap-3 pt-6 ml-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-6 h-6 rounded-lg border-gray-200 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Featured Product</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
              <Editor 
                value={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                placeholder="Tell more about the product features, fabric, and care..."
              />
            </div>
          </section>

          {/* Dynamic Attributes */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Product Attributes
              </h3>
              <button 
                type="button" 
                onClick={addAttribute}
                className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Attribute
              </button>
            </div>
            
            <div className="space-y-4">
              {attributes.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">No attributes added yet.</p>
              )}
              {attributes.map((attr, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 relative group">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                    <input 
                      placeholder="Size, Color..."
                      value={attr.name}
                      onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Value</label>
                    <input 
                      placeholder="XL, Red..."
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Price (Optional)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        placeholder="Overwrites base"
                        value={attr.price}
                        onChange={(e) => handleAttributeChange(index, 'price', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-black outline-none focus:border-indigo-600"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">৳</span>
                    </div>
                  </div>
                  <div className="flex items-end pb-1.5">
                    <button 
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="w-full md:w-auto p-2.5 bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 md:block"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="md:hidden text-xs font-bold uppercase tracking-widest">Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Image Gallery */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
              Product Gallery
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group">
                  <img src={img.src} alt="preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-indigo-600 text-[10px] text-white font-bold rounded-md uppercase tracking-widest">Main</span>
                  )}
                </div>
              ))}
              
              <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all cursor-pointer">
                <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest text-center px-2">Add Images</span>
              </label>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="pt-10 flex flex-col md:flex-row gap-4 border-t border-gray-100">
            <button disabled={saving || loading} type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70">
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/products" className="flex-1 py-5 border border-gray-200 text-gray-500 rounded-2xl font-bold uppercase tracking-[0.2em] text-sm text-center hover:bg-gray-50 transition-all">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

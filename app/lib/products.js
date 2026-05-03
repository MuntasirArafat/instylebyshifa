// Central product catalog — single source of truth
export const products = [
  {
    id: 1,
    slug: "cream-abaya-embroidery-stone",
    name: "Cream Color Abaya with Embroidery & Stone Work",
    category: "Abaya",
    originalPrice: 10000,
    price: 8000,
    images: [
      "https://iraniborkabazar.com/wp-content/uploads/2026/03/Abaya-2-600x900.jpg",
      "https://iraniborkabazar.com/wp-content/uploads/2026/03/Abaya-1-600x900.jpg",
      "https://iraniborkabazar.com/wp-content/uploads/2026/03/Abaya-600x900.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    highlights: ["Premium embroidery with stone work", "Soft chiffon fabric", "Available in all sizes"],
  },
  {
    id: 2,
    slug: "gown-borka-chiffon",
    name: "Gown Borka with Premium Chiffon Fabric",
    category: "Borka",
    originalPrice: 12000,
    price: 9500,
    images: [
      "https://iraniborkabazar.com/wp-content/uploads/2026/03/Gown-Borka-600x900.jpg",
      "https://iraniborkabazar.com/wp-content/uploads/2026/03/Gown-Borka.jpg",
    ],
    sizes: ["M", "L", "XL", "XXL"],
    highlights: ["Elegant gown-style cut", "Premium chiffon fabric", "Full-length design"],
  },
  {
    id: 3,
    slug: "koti-borka-elegant",
    name: "Koti Borka with Elegant Design",
    category: "Borka",
    originalPrice: 8000,
    price: 6500,
    images: [
      "https://iraniborkabazar.com/wp-content/uploads/2026/03/Koti-Borka-600x900.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    highlights: ["Koti-style overlay", "Modern modest fashion", "Easy to wear"],
  },
  {
    id: 4,
    slug: "borka-design-premium",
    name: "Premium Borka Design Collection",
    category: "Borka",
    originalPrice: 9000,
    price: 7200,
    images: [
      "https://iraniborkabazar.com/wp-content/uploads/2026/03/Borka-Design-600x900.jpg",
      "https://iraniborkabazar.com/wp-content/uploads/2026/02/Borka-Design-600x900.jpg",
    ],
    sizes: ["M", "L", "XL", "XXL"],
    highlights: ["Unique design patterns", "High-quality stitching", "Modest and stylish"],
  },
  {
    id: 5,
    slug: "abaya-classic-black",
    name: "Classic Black Abaya",
    category: "Abaya",
    originalPrice: 8500,
    price: 6800,
    images: [
      "https://iraniborkabazar.com/wp-content/uploads/2026/03/Abaya-1-600x900.jpg",
      "https://iraniborkabazar.com/wp-content/uploads/2026/03/Abaya-600x900.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    highlights: ["Classic all-black design", "Flowing silhouette", "Everyday elegance"],
  },
  {
    id: 6,
    slug: "borka-design-classic",
    name: "Classic Borka Design with Lace",
    category: "Borka",
    originalPrice: 7500,
    price: 5900,
    images: [
      "https://iraniborkabazar.com/wp-content/uploads/2026/02/Borka-Design-600x900.jpg",
    ],
    sizes: ["M", "L", "XL"],
    highlights: ["Lace detailing", "Lightweight fabric", "Traditional meets modern"],
  },
  {
    id: 7,
    slug: "gown-borka-winter",
    name: "Winter Gown Borka Collection",
    category: "Borka",
    originalPrice: 11000,
    price: 8800,
    images: [
      "https://iraniborkabazar.com/wp-content/uploads/2025/12/Gown-Borka-600x900.jpg",
    ],
    sizes: ["M", "L", "XL", "XXL"],
    highlights: ["Warm fabric blend", "Full-length coverage", "Elegant for winter"],
  },
  {
    id: 8,
    slug: "abaya-classic-winter",
    name: "Winter Classic Abaya",
    category: "Abaya",
    originalPrice: 9500,
    price: 7500,
    images: [
      "https://iraniborkabazar.com/wp-content/uploads/2025/12/Abaya-600x900.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    highlights: ["Warm and cozy fabric", "Classic abaya cut", "Perfect for winter"],
  },
];

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug) || null;
}

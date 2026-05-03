import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";

function normalizeProduct(doc) {
  return {
    ...doc,
    _id: doc?._id?.toString?.() ?? doc?._id,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Number(searchParams.get("limit") || 10), 100);
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const isFeatured = searchParams.get("isFeatured") === "true";

  const filter = {};
  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { slug: searchRegex }
    ];
  }
  if (category) {
    const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.category = { $regex: `^${escapedCategory}$`, $options: "i" };
  }
  if (isFeatured) filter.isFeatured = true;

  const db = await getDb();
  const [total, docs] = await Promise.all([
    db.collection("products").countDocuments(filter),
    db.collection("products")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  ]);

  return NextResponse.json({
    products: docs.map(normalizeProduct),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  });
}

export async function POST(req) {
  const db = await getDb();
  const body = await req.json();

  const now = new Date();
  const doc = {
    name: body?.name ?? "",
    slug: body?.slug ?? "",
    category: body?.category ?? "Abaya",
    price: Number(body?.price ?? 0),
    originalPrice: Number(body?.originalPrice ?? 0),
    stock: Number(body?.stock ?? 0),
    status: body?.status ?? "In Stock",
    isFeatured: Boolean(body?.isFeatured),
    description: body?.description ?? "",
    images: Array.isArray(body?.images) ? body.images : [],
    attributes: Array.isArray(body?.attributes) ? body.attributes : [],
    sizes: Array.isArray(body?.sizes) ? body.sizes : [],
    highlights: Array.isArray(body?.highlights) ? body.highlights : [],
    createdAt: now,
    updatedAt: now,
  };

  if (!doc.slug) {
    return NextResponse.json(
      { error: "slug is required" },
      { status: 400 },
    );
  }

  const existing = await db.collection("products").findOne({ slug: doc.slug });
  if (existing) {
    return NextResponse.json(
      { error: "slug already exists" },
      { status: 409 },
    );
  }

  const result = await db.collection("products").insertOne(doc);
  return NextResponse.json({ _id: result.insertedId.toString() }, { status: 201 });
}


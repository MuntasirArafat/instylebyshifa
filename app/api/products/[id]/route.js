import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/app/lib/mongodb";

function normalizeProduct(doc) {
  if (!doc) return null;
  return { ...doc, _id: doc._id?.toString?.() ?? doc._id };
}

export async function GET(_req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const doc = await db.collection("products").findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(normalizeProduct(doc));
}

export async function PUT(req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const db = await getDb();

  if (body?.slug) {
    const existing = await db.collection("products").findOne({
      slug: body.slug,
      _id: { $ne: new ObjectId(id) },
    });
    if (existing) {
      return NextResponse.json({ error: "slug already exists" }, { status: 409 });
    }
  }

  const update = {
    ...(body?.name !== undefined ? { name: body.name } : {}),
    ...(body?.slug !== undefined ? { slug: body.slug } : {}),
    ...(body?.category !== undefined ? { category: body.category } : {}),
    ...(body?.price !== undefined ? { price: Number(body.price) } : {}),
    ...(body?.originalPrice !== undefined ? { originalPrice: Number(body.originalPrice) } : {}),
    ...(body?.stock !== undefined ? { stock: Number(body.stock) } : {}),
    ...(body?.status !== undefined ? { status: body.status } : {}),
    ...(body?.isFeatured !== undefined ? { isFeatured: Boolean(body.isFeatured) } : {}),
    ...(body?.description !== undefined ? { description: body.description } : {}),
    ...(body?.images !== undefined ? { images: Array.isArray(body.images) ? body.images : [] } : {}),
    ...(body?.attributes !== undefined ? { attributes: Array.isArray(body.attributes) ? body.attributes : [] } : {}),
    ...(body?.sizes !== undefined ? { sizes: Array.isArray(body.sizes) ? body.sizes : [] } : {}),
    ...(body?.highlights !== undefined ? { highlights: Array.isArray(body.highlights) ? body.highlights : [] } : {}),
    updatedAt: new Date(),
  };

  const result = await db
    .collection("products")
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );

  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(normalizeProduct(result));
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("products").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ deletedCount: result.deletedCount });
}


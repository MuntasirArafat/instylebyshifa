import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";

function normalizeCategory(doc) {
  return {
    ...doc,
    _id: doc?._id?.toString?.() ?? doc?._id,
  };
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-');      // Replace multiple - with single -
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "1000"); // Default high for full lists
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  const db = await getDb();

  let query = {};
  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ],
    };
  }

  const [docs, total] = await Promise.all([
    db.collection("categories")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("categories").countDocuments(query),
  ]);

  return NextResponse.json({
    categories: docs.map(normalizeCategory),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req) {
  const db = await getDb();
  const body = await req.json();

  const now = new Date();
  const name = String(body?.name ?? "").trim();
  const slug = slugify(name);

  const doc = {
    name,
    slug,
    description: String(body?.description ?? "").trim(),
    showInMenu: Boolean(body?.showInMenu ?? false),
    parentId: body?.parentId ? String(body.parentId) : null,
    createdAt: now,
    updatedAt: now,
  };

  if (!doc.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const existing = await db.collection("categories").findOne({ slug: doc.slug });
  if (existing) {
    doc.slug = `${doc.slug}-${Math.floor(Math.random() * 1000)}`;
  }

  const result = await db.collection("categories").insertOne(doc);
  return NextResponse.json({ _id: result.insertedId.toString() }, { status: 201 });
}


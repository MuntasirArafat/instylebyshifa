import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/app/lib/mongodb";

function normalizeCategory(doc) {
  if (!doc) return null;
  return { ...doc, _id: doc._id?.toString?.() ?? doc._id };
}

export async function GET(_req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const doc = await db.collection("categories").findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(normalizeCategory(doc));
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function PUT(req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const db = await getDb();

  const update = {
    ...(body?.name !== undefined ? { 
      name: String(body.name).trim(),
      slug: slugify(String(body.name))
    } : {}),
    ...(body?.description !== undefined ? { description: String(body.description).trim() } : {}),
    ...(body?.showInMenu !== undefined ? { showInMenu: Boolean(body.showInMenu) } : {}),
    ...(body?.parentId !== undefined ? { parentId: body.parentId ? String(body.parentId) : null } : {}),
    updatedAt: new Date(),
  };

  const result = await db.collection("categories").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: "after" },
  );

  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(normalizeCategory(result));
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("categories").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ deletedCount: result.deletedCount });
}


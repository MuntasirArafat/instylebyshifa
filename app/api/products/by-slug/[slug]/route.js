import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";

function normalizeProduct(doc) {
  if (!doc) return null;
  return { ...doc, _id: doc._id?.toString?.() ?? doc._id };
}

export async function GET(_req, { params }) {
  const { slug } = await params;

  const db = await getDb();
  const doc = await db.collection("products").findOne({ slug });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(normalizeProduct(doc));
}


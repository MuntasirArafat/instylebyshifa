import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/app/lib/mongodb";
import { queueNotification } from "@/app/lib/notifications";

function normalizeOrder(doc) {
  if (!doc) return null;
  return { ...doc, _id: doc._id?.toString?.() ?? doc._id };
}

export async function GET(_req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const doc = await db.collection("orders").findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(normalizeOrder(doc));
}

export async function PUT(req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const db = await getDb();

  // Fetch current order to check for status change
  const currentOrder = await db.collection("orders").findOne({ _id: new ObjectId(id) });
  if (!currentOrder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = body?.status !== undefined ? String(body.status).trim() : currentOrder.status;

  const update = {
    status: newStatus,
    ...(body?.internalNote !== undefined ? { internalNote: String(body.internalNote) } : {}),
    updatedAt: new Date(),
  };

  const result = await db.collection("orders").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: "after" },
  );

  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If status actually changed, queue notification
  if (newStatus !== currentOrder.status) {
    await queueNotification('STATUS_CHANGED', {
      orderNumber: result.orderNumber,
      customerName: result.customer.firstName,
      customerPhone: result.customer.phone,
      newStatus: newStatus
    });
  }

  return NextResponse.json(normalizeOrder(result));
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("orders").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ deletedCount: result.deletedCount });
}


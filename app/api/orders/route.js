import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { queueNotification } from "@/app/lib/notifications";

function normalizeOrder(doc) {
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
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    filter.$or = [
      { orderNumber: searchRegex },
      { "customer.firstName": searchRegex },
      { "customer.lastName": searchRegex },
      { "customer.email": searchRegex },
      { "customer.phone": searchRegex },
    ];
  }

  if (fromDate || toDate) {
    const dateFilter = {};
    const dFrom = fromDate ? new Date(fromDate) : null;
    const dTo = toDate ? new Date(toDate) : null;

    if (dFrom && !isNaN(dFrom.getTime())) {
      dateFilter.$gte = dFrom;
    }
    if (dTo && !isNaN(dTo.getTime())) {
      const endOfDay = new Date(dTo);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.$lte = endOfDay;
    }

    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }
  }

  const db = await getDb();
  
  const [total, docs] = await Promise.all([
    db.collection("orders").countDocuments(filter),
    db.collection("orders")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  ]);

  return NextResponse.json({
    orders: docs.map(normalizeOrder),
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
  const items = Array.isArray(body?.items) ? body.items : [];

  const subtotal = Number(body?.subtotal ?? 0);
  const shipping = Number(body?.shipping ?? 0);
  const tax = Number(body?.tax ?? 0);
  const total = Number(body?.total ?? subtotal + shipping + tax);

  const doc = {
    orderNumber: String(body?.orderNumber || "").trim() || `ISB-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: {
      firstName: String(body?.customer?.firstName ?? "").trim(),
      lastName: String(body?.customer?.lastName ?? "").trim(),
      email: String(body?.customer?.email ?? "").trim(),
      phone: String(body?.customer?.phone ?? "").trim(),
    },
    shippingAddress: {
      address: String(body?.shippingAddress?.address ?? "").trim(),
      city: String(body?.shippingAddress?.city ?? "").trim(),
      postalCode: String(body?.shippingAddress?.postalCode ?? "").trim(),
      country: String(body?.shippingAddress?.country ?? "Bangladesh").trim(),
    },
    paymentMethod: String(body?.paymentMethod ?? "cod").trim(),
    items,
    amounts: { subtotal, shipping, tax, total },
    status: String(body?.status ?? "Pending").trim(),
    internalNote: String(body?.internalNote ?? "").trim(),
    createdAt: now,
    updatedAt: now,
  };

  if (!Array.isArray(doc.items) || doc.items.length === 0) {
    return NextResponse.json({ error: "items is required" }, { status: 400 });
  }

  const result = await db.collection("orders").insertOne(doc);
  
  // Queue Background Notifications
  await queueNotification('ORDER_PLACED', {
    orderNumber: doc.orderNumber,
    customerName: doc.customer.firstName,
    customerPhone: doc.customer.phone,
    customerEmail: doc.customer.email,
    total: doc.amounts.total
  });

  return NextResponse.json({ _id: result.insertedId.toString(), orderNumber: doc.orderNumber }, { status: 201 });
}


import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";

function normalizeOrder(doc) {
  if (!doc) return null;
  return { ...doc, _id: doc._id?.toString?.() ?? doc._id };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const db = await getDb();

  let dateFilter = {};
  if (from || to) {
    dateFilter.createdAt = {};
    if (from) dateFilter.createdAt.$gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.createdAt.$lte = toDate;
    }
  }

  const [ordersCount, productsCount, pendingOrdersCount] = await Promise.all([
    db.collection("orders").countDocuments(dateFilter),
    db.collection("products").countDocuments({}),
    db.collection("orders").countDocuments({ ...dateFilter, status: "Pending" }),
  ]);

  const revenueAgg = await db
    .collection("orders")
    .aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$amounts.total" } } }
    ])
    .toArray();

  const revenue = Number(revenueAgg?.[0]?.total ?? 0);

  const customersAgg = await db
    .collection("orders")
    .aggregate([
      { $match: { ...dateFilter, "customer.email": { $type: "string", $ne: "" } } },
      { $group: { _id: "$customer.email" } },
      { $count: "count" },
    ])
    .toArray();
  const customersCount = Number(customersAgg?.[0]?.count ?? 0);

  const recentOrders = await db
    .collection("orders")
    .find(dateFilter)
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  // Chart Data: Last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyOrdersAgg = await db
    .collection("orders")
    .aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$amounts.total" }
        }
      },
      { $sort: { _id: 1 } }
    ])
    .toArray();

  const dailyVisitorsAgg = await db
    .collection("analytics")
    .find({ date: { $gte: sevenDaysAgo } })
    .toArray();

  // Create a 7-day range for charts
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    const orderMatch = dailyOrdersAgg.find(item => item._id === dateStr);
    
    // Find visitor match (ensure date comparison is correct)
    const dStart = new Date(dateStr);
    dStart.setHours(0,0,0,0);
    const visitorMatch = dailyVisitorsAgg.find(v => {
      const vDate = new Date(v.date);
      vDate.setHours(0,0,0,0);
      return vDate.getTime() === dStart.getTime();
    });

    chartData.push({
      date: new Date(dateStr).toLocaleDateString("en-US", { weekday: 'short' }),
      orders: orderMatch ? orderMatch.count : 0,
      revenue: orderMatch ? orderMatch.revenue : 0,
      visitors: visitorMatch ? visitorMatch.visitors : 0
    });
  }

  return NextResponse.json({
    stats: {
      totalOrders: ordersCount,
      totalEarning: revenue,
      products: productsCount,
      customers: customersCount,
      pendingOrders: pendingOrdersCount,
    },
    recentOrders: recentOrders.map(normalizeOrder),
    chartData
  });
}


import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";

export async function POST(req) {
  try {
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // We use an upsert to count visits per day
    // This is more efficient than storing every single hit as a document
    await db.collection("analytics").updateOne(
      { date: today },
      { $inc: { visitors: 1 } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

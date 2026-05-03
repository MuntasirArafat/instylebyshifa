import { NextResponse } from "next/server";
import { processQueue } from "@/app/lib/notifications";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  // Simple auth check using a secret key in header or query if needed
  // For now, let's just allow it for simplicity as requested
  try {
    await processQueue();
    return NextResponse.json({ success: true, timestamp: new Date() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "instylebyshifa_secret_key_123");

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const db = await getDb();
    
    let settings = await db.collection("settings").findOne({ _id: "store" });
    let admin = settings?.security;

    if (!admin) {
      // Auto-configure default admin if not exists
      const salt = await bcrypt.genSalt(10);
      const hashedDefault = await bcrypt.hash("admin123", salt);
      admin = {
        adminEmail: "admin@instylebyshifa.com",
        adminPassword: hashedDefault
      };
      
      await db.collection("settings").updateOne(
        { _id: "store" },
        { 
          $set: { security: admin, updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.adminPassword);
    const isEmailMatch = email === admin.adminEmail;

    if (!isMatch || !isEmailMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await new SignJWT({ email: admin.adminEmail, role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(SECRET);

    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

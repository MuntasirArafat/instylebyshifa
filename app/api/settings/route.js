import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";

export async function GET() {
  const db = await getDb();
  let doc = await db.collection("settings").findOne({ _id: "store" });
  
  if (!doc) {
    const salt = await bcrypt.genSalt(10);
    const hashedDefault = await bcrypt.hash("admin123", salt);
    const initial = {
      _id: "store",
      security: {
        adminEmail: "admin@instylebyshifa.com",
        adminPassword: hashedDefault
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection("settings").insertOne(initial);
    doc = initial;
  }

  // Security check: never return password to frontend
  const safeDoc = { ...doc };
  if (safeDoc.security) {
    const { adminPassword, ...rest } = safeDoc.security;
    safeDoc.security = rest;
  }
  
  return NextResponse.json(safeDoc);
}

export async function PUT(req) {
  const db = await getDb();
  const body = await req.json();

  const update = {
    ...(body?.general !== undefined ? { general: body.general } : {}),
    ...(body?.sms !== undefined ? { sms: body.sms } : {}),
    ...(body?.email !== undefined ? { email: body.email } : {}),
    ...(body?.customScripts !== undefined ? { customScripts: body.customScripts } : {}),
    updatedAt: new Date(),
  };

  // Special handling for security to hash password
  if (body?.security) {
    const securityUpdate = { ...body.security };
    if (securityUpdate.adminPassword) {
      const salt = await bcrypt.genSalt(10);
      securityUpdate.adminPassword = await bcrypt.hash(securityUpdate.adminPassword, salt);
    } else {
      // If password not provided in update, don't overwrite existing one
      const existing = await db.collection("settings").findOne({ _id: "store" });
      securityUpdate.adminPassword = existing?.security?.adminPassword;
    }
    update.security = securityUpdate;
  }

  await db.collection("settings").updateOne(
    { _id: "store" },
    { $set: update, $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );

  const doc = await db.collection("settings").findOne({ _id: "store" });
  // Never return password
  if (doc?.security) delete doc.security.adminPassword;
  
  return NextResponse.json(doc);
}


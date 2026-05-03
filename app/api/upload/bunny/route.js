import { NextResponse } from "next/server";

function sanitizeFilename(name) {
  const base = String(name || "upload")
    .trim()
    .replace(/[/\\\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-");
  return base || "upload";
}

export async function POST(req) {
  const accessKey = process.env.BUNNY_STORAGE_ACCESS_KEY;
  const storageZone = process.env.BUNNY_STORAGE_ZONE;
  const storageHost = process.env.BUNNY_STORAGE_HOST || "storage.bunnycdn.com";
  const publicBase = process.env.BUNNY_PUBLIC_BASE_URL;
  const folder = process.env.BUNNY_STORAGE_FOLDER || "products";

  if (!accessKey || !storageZone || !publicBase) {
    return NextResponse.json(
      {
        error:
          "Missing Bunny env vars. Set BUNNY_STORAGE_ACCESS_KEY, BUNNY_STORAGE_ZONE, BUNNY_PUBLIC_BASE_URL.",
      },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const ext = String(file.name || "").includes(".")
    ? `.${String(file.name).split(".").pop()}`
    : "";
  const filename = `${Date.now()}-${sanitizeFilename(file.name)}${ext}`.replace(
    /\.(\w+)\.\1$/,
    ".$1",
  );

  const objectPath = `${folder}/${filename}`.replace(/^\/+/, "");
  const uploadUrl = `https://${storageHost}/${storageZone}/${objectPath}`;

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      AccessKey: accessKey,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: Buffer.from(arrayBuffer),
  });

  if (!putRes.ok) {
    const text = await putRes.text().catch(() => "");
    return NextResponse.json(
      { error: "Bunny upload failed", details: text },
      { status: 502 },
    );
  }

  const publicUrl = `${publicBase.replace(/\/+$/, "")}/${objectPath}`;
  return NextResponse.json({ url: publicUrl });
}


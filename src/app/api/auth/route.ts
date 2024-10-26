import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const privateKey = process.env.PRIVATE_KEY || "";

export async function GET(request: NextRequest) {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400;
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return NextResponse.json({
    token,
    expire,
    signature,
  });
}

import { NextResponse } from "next/server";
import { getProfile } from "@/lib/content-loader";

export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json(profile);
  } catch (e) {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

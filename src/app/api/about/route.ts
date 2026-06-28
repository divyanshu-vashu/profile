import { NextResponse } from "next/server";
import { getAboutConfig } from "@/lib/content-loader";

export async function GET() {
  try {
    const config = await getAboutConfig();
    return NextResponse.json(config);
  } catch (e) {
    return NextResponse.json({ error: "Failed to load about details" }, { status: 500 });
  }
}

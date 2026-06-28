import { NextResponse } from "next/server";
import { getUIConfig } from "@/lib/content-loader";

export async function GET() {
  try {
    const config = await getUIConfig();
    return NextResponse.json(config);
  } catch (e) {
    return NextResponse.json({ error: "Failed to load UI config" }, { status: 500 });
  }
}

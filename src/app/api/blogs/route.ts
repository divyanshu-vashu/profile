import { NextResponse } from "next/server";
import { getAllBlogs } from "@/lib/content-loader";

export async function GET() {
  try {
    const blogs = await getAllBlogs();
    const formatted = blogs.map((b, i) => ({
      id: `b-${i}`,
      title: b.title,
      description: b.description,
      category: b.category,
      updatedText: b.updatedText,
      featured: b.featured,
      icon: b.icon || "code",
    }));
    return NextResponse.json(formatted);
  } catch (e) {
    return NextResponse.json({ error: "Failed to load blogs" }, { status: 500 });
  }
}

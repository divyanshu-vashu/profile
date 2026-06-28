import { NextResponse } from "next/server";
import { getAllLibraryItems } from "@/lib/content-loader";

export async function GET() {
  try {
    const libraryItems = await getAllLibraryItems();
    const formatted = libraryItems.map((item, i) => ({
      id: `r-${i}`,
      title: item.title,
      category: item.type === "paper" ? "Research Paper" : item.type === "book" ? "Book" : "Blog",
      description: item.description,
      isNew: item.featured,
      url: item.url,
    }));
    return NextResponse.json(formatted);
  } catch (e) {
    return NextResponse.json({ error: "Failed to load library items" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getAllProjects, getProjectPageConfig } from "@/lib/content-loader";

export async function GET() {
  try {
    const projects = await getAllProjects();
    const config = await getProjectPageConfig();
    const categories = config.categories || ["All", "Web Apps", "Machine Learning", "CLI Tools"];

    // Re-format to match front-end types
    const formatted = projects.map((p, i) => ({
      id: `p-${i}`,
      title: p.title,
      description: p.description,
      category: p.category,
      tags: p.tags,
      icon: p.icon,
    }));
    // Return empty archivedProjects list since all are active/completed projects in filesystem
    return NextResponse.json({ projects: formatted, archivedProjects: [], categories });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

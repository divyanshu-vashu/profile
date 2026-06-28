import fs from "fs/promises";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "storage", "content");

// Simple markdown frontmatter parser
function parseMarkdown(fileContent: string) {
  const lines = fileContent.split("\n");
  const frontmatter: Record<string, any> = {};
  let body = "";
  let inFrontmatter = false;
  let hasParsedFrontmatter = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "---") {
      if (!inFrontmatter && !hasParsedFrontmatter) {
        inFrontmatter = true;
      } else if (inFrontmatter) {
        inFrontmatter = false;
        hasParsedFrontmatter = true;
      }
      continue;
    }

    if (inFrontmatter) {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value: any = match[2].trim();
        // Parse array JSON style if it looks like one, or simple quotes
        if (value.startsWith("[") && value.endsWith("]")) {
          try {
            value = JSON.parse(value.replace(/'/g, '"'));
          } catch (e) {}
        } else if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value === "true") {
          value = true;
        } else if (value === "false") {
          value = false;
        }
        frontmatter[key] = value;
      }
    } else {
      body += line + "\n";
    }
  }

  return { frontmatter, content: body.trim() };
}

export async function getProfile() {
  const profilePath = path.join(CONTENT_DIR, "profile.json");
  const data = await fs.readFile(profilePath, "utf-8");
  return JSON.parse(data);
}

export async function getUIConfig() {
  const configPath = path.join(CONTENT_DIR, "ui-config.json");
  const data = await fs.readFile(configPath, "utf-8");
  return JSON.parse(data);
}

export async function getProjectPageConfig() {
  const configPath = path.join(CONTENT_DIR, "project-page.config.json");
  const data = await fs.readFile(configPath, "utf-8");
  return JSON.parse(data);
}

export async function getAboutConfig() {
  const configPath = path.join(CONTENT_DIR, "aboutview.config.json");
  const data = await fs.readFile(configPath, "utf-8");
  return JSON.parse(data);
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
  updatedText: string;
  featured: boolean;
  icon?: string;
  content: string;
  isSeries?: boolean;
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const blogDir = path.join(CONTENT_DIR, "blog");
  const posts: BlogPost[] = [];

  async function scan(dir: string, baseSlug = "") {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await scan(fullPath, baseSlug ? `${baseSlug}/${entry.name}` : entry.name);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const contentStr = await fs.readFile(fullPath, "utf-8");
          const { frontmatter, content } = parseMarkdown(contentStr);
          const nameWithoutExt = path.basename(entry.name, ".md");
          const slug = baseSlug ? `${baseSlug}/${nameWithoutExt}` : nameWithoutExt;

          posts.push({
            slug,
            title: frontmatter.title || nameWithoutExt,
            description: frontmatter.description || "",
            category: frontmatter.category || "General",
            tags: frontmatter.tags || [],
            date: frontmatter.date || "",
            updatedText: frontmatter.updatedText || "",
            featured: !!frontmatter.featured,
            icon: frontmatter.icon,
            content,
          });
        }
      }
    } catch (e) {
      console.warn("Skipping blog directory scan:", e);
    }
  }

  await scan(blogDir);
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const blogs = await getAllBlogs();
  return blogs.find((b) => b.slug === slug) || null;
}

export interface ProjectData {
  slug: string;
  title: string;
  description: string;
  featured: boolean;
  status: string;
  tags: string[];
  cover: string;
  github: string;
  demo: string;
  category: string;
  icon: string;
  caseStudy: string;
}

export async function getAllProjects(): Promise<ProjectData[]> {
  const projectsDir = path.join(CONTENT_DIR, "projects");
  const projectsList: ProjectData[] = [];

  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(projectsDir, entry.name);
        const indexPath = path.join(projectPath, "index.json");
        const caseStudyPath = path.join(projectPath, "case-study.md");

        const indexContent = await fs.readFile(indexPath, "utf-8");
        const metadata = JSON.parse(indexContent);

        let caseStudy = "";
        try {
          caseStudy = await fs.readFile(caseStudyPath, "utf-8");
        } catch (e) {
          // If case-study.md doesn't exist, we fallback
        }

        projectsList.push({
          slug: entry.name,
          ...metadata,
          caseStudy,
        });
      }
    }
  } catch (e) {
    console.warn("Skipping projects directory scan:", e);
  }

  return projectsList;
}

export async function getProject(slug: string): Promise<ProjectData | null> {
  const projects = await getAllProjects();
  return projects.find((p) => p.slug === slug) || null;
}

export interface LibraryItem {
  slug: string;
  title: string;
  type: string;
  url: string;
  author: string;
  image: string;
  tags: string[];
  featured: boolean;
  description: string;
  content: string;
}

export async function getAllLibraryItems(): Promise<LibraryItem[]> {
  const libraryDir = path.join(CONTENT_DIR, "library");
  const items: LibraryItem[] = [];

  try {
    const entries = await fs.readdir(libraryDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        const fullPath = path.join(libraryDir, entry.name);
        const contentStr = await fs.readFile(fullPath, "utf-8");
        const { frontmatter, content } = parseMarkdown(contentStr);
        const nameWithoutExt = path.basename(entry.name, ".md");

        items.push({
          slug: nameWithoutExt,
          title: frontmatter.title || nameWithoutExt,
          type: frontmatter.type || "paper",
          url: frontmatter.url || "",
          author: frontmatter.author || "",
          image: frontmatter.image || "",
          tags: frontmatter.tags || [],
          featured: !!frontmatter.featured,
          description: frontmatter.description || "",
          content,
        });
      }
    }
  } catch (e) {
    console.warn("Skipping library directory scan:", e);
  }

  return items;
}

export async function getLibraryItem(slug: string): Promise<LibraryItem | null> {
  const items = await getAllLibraryItems();
  return items.find((item) => item.slug === slug) || null;
}

export async function getAllTags() {
  const blogs = await getAllBlogs();
  const projects = await getAllProjects();
  const library = await getAllLibraryItems();

  const tagsSet = new Set<string>();
  blogs.forEach((b) => b.tags.forEach((t) => tagsSet.add(t)));
  projects.forEach((p) => p.tags.forEach((t) => tagsSet.add(t.toLowerCase())));
  library.forEach((l) => l.tags.forEach((t) => tagsSet.add(t)));

  return Array.from(tagsSet);
}

export async function getItemsByTag(tag: string) {
  const lowerTag = tag.toLowerCase();
  const blogs = await getAllBlogs();
  const projects = await getAllProjects();
  const library = await getAllLibraryItems();

  return {
    blogs: blogs.filter((b) => b.tags.map(t => t.toLowerCase()).includes(lowerTag)),
    projects: projects.filter((p) => p.tags.map(t => t.toLowerCase()).includes(lowerTag)),
    library: library.filter((l) => l.tags.map(t => t.toLowerCase()).includes(lowerTag)),
  };
}

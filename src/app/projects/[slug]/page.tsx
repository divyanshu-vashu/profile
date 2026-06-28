import { getProject, getAllProjects } from "@/lib/content-loader";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-20 text-neutral-900">
      <Link href="/" className="text-sm text-neutral-500 hover:text-black mb-8 inline-block font-mono">
        &larr; Back to Dashboard
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-600">
          {project.category}
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          {project.status}
        </span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{project.title}</h1>
      <p className="text-lg text-neutral-500 mb-8">{project.description}</p>
      
      <div className="flex gap-4 mb-10">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-neutral-700 hover:text-black border border-neutral-200 px-4 py-2 rounded-lg transition"
          >
            GitHub Repository &rarr;
          </a>
        )}
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-white bg-black hover:bg-neutral-800 px-4 py-2 rounded-lg transition"
          >
            Live Demo &rarr;
          </a>
        )}
      </div>

      <div className="border-t border-neutral-100 pt-8 prose prose-neutral max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed text-neutral-700 text-base md:text-lg">
          {project.caseStudy}
        </div>
      </div>
      
      {project.tags && project.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-neutral-100 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag.toLowerCase()}`}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-3 py-1 rounded text-xs font-mono transition"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

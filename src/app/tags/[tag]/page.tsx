import { getItemsByTag, getAllTags } from "@/lib/content-loader";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    tag: tag.toLowerCase(),
  }));
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const { blogs, projects, library } = await getItemsByTag(tag);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 text-neutral-900">
      <Link href="/" className="text-sm text-neutral-500 hover:text-black mb-8 inline-block font-mono">
        &larr; Back to Dashboard
      </Link>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
        Topic: <span className="text-neutral-500">#{tag}</span>
      </h1>

      <div className="space-y-12">
        {/* Projects section */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-xl font-mono uppercase tracking-wider text-neutral-400 mb-4 border-b border-neutral-100 pb-2">
              Related Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <Link
                  key={proj.slug}
                  href={`/projects/${proj.slug}`}
                  className="block p-5 border border-neutral-200 hover:border-black/30 rounded-xl transition"
                >
                  <h3 className="font-semibold text-lg text-neutral-900 mb-1">{proj.title}</h3>
                  <p className="text-sm text-neutral-500">{proj.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blogs section */}
        {blogs.length > 0 && (
          <div>
            <h2 className="text-xl font-mono uppercase tracking-wider text-neutral-400 mb-4 border-b border-neutral-100 pb-2">
              Related Articles
            </h2>
            <div className="space-y-4">
              {blogs.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block p-5 border border-neutral-200 hover:border-black/30 rounded-xl transition"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-neutral-900 mb-1">{post.title}</h3>
                    <span className="text-xs text-neutral-400 font-mono">{post.date}</span>
                  </div>
                  <p className="text-sm text-neutral-500">{post.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Library section */}
        {library.length > 0 && (
          <div>
            <h2 className="text-xl font-mono uppercase tracking-wider text-neutral-400 mb-4 border-b border-neutral-100 pb-2">
              Library Resources
            </h2>
            <div className="space-y-4">
              {library.map((item) => (
                <Link
                  key={item.slug}
                  href={`/library/${item.slug}`}
                  className="block p-5 border border-neutral-200 hover:border-black/30 rounded-xl transition"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-neutral-900 mb-1">{item.title}</h3>
                    <span className="text-xs text-neutral-400 font-mono">by {item.author}</span>
                  </div>
                  <p className="text-sm text-neutral-500">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && blogs.length === 0 && library.length === 0 && (
          <p className="text-neutral-500 font-mono">No resources connected to this topic tag yet.</p>
        )}
      </div>
    </div>
  );
}

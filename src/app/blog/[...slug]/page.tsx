import { getBlogPost, getAllBlogs } from "@/lib/content-loader";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const posts = await getAllBlogs();
  return posts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug.join("/"));

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-20 text-neutral-900">
      <Link href="/" className="text-sm text-neutral-500 hover:text-black mb-8 inline-block font-mono">
        &larr; Back to Dashboard
      </Link>
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-600">
          {post.category}
        </span>
        <span className="text-xs text-neutral-400 font-mono">{post.date}</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{post.title}</h1>
      <p className="text-lg text-neutral-500 mb-8 italic">{post.description}</p>
      <div className="border-t border-neutral-100 pt-8 prose prose-neutral max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed text-neutral-700 text-base md:text-lg">
          {post.content}
        </div>
      </div>
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-neutral-100 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
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

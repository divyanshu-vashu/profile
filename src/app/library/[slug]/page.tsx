import { getLibraryItem, getAllLibraryItems } from "@/lib/content-loader";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const items = await getAllLibraryItems();
  return items.map((item) => ({
    slug: item.slug,
  }));
}

export default async function LibraryItemPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getLibraryItem(slug);

  if (!item) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-20 text-neutral-900">
      <Link href="/" className="text-sm text-neutral-500 hover:text-black mb-8 inline-block font-mono">
        &larr; Back to Dashboard
      </Link>
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-600">
          {item.type}
        </span>
        <span className="text-xs text-neutral-400 font-mono">by {item.author}</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{item.title}</h1>
      <p className="text-lg text-neutral-500 mb-8">{item.description}</p>
      
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-neutral-700 hover:text-black border border-neutral-200 px-4 py-2 rounded-lg transition inline-block mb-10"
        >
          View Resource Reference &rarr;
        </a>
      )}

      <div className="border-t border-neutral-100 pt-8 prose prose-neutral max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed text-neutral-700 text-base md:text-lg">
          {item.content}
        </div>
      </div>
      
      {item.tags && item.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-neutral-100 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
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

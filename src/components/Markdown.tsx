import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownProps {
  text: string;
}

export default function Markdown({ text }: MarkdownProps) {
  if (!text) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold my-4 text-neutral-950 dark:text-neutral-50 border-b border-neutral-200 dark:border-neutral-800 pb-1">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mt-4 mb-2 text-neutral-900 dark:text-neutral-100">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mt-3 mb-1 text-neutral-850 dark:text-neutral-150">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold mt-2 mb-1 text-neutral-800 dark:text-neutral-200">
            {children}
          </h4>
        ),
        hr: () => (
          <hr className="my-4 border-neutral-200 dark:border-neutral-800" />
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            {children}
          </a>
        ),
        p: ({ children }) => (
          <p className="leading-relaxed my-2 text-neutral-850 dark:text-neutral-200">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-neutral-950 dark:text-neutral-50">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-neutral-800 dark:text-neutral-200">
            {children}
          </em>
        ),
        ul: ({ children }) => (
          <ul className="space-y-1.5 my-3 pl-4 list-disc text-neutral-800 dark:text-neutral-200">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-1.5 my-3 pl-4 list-decimal text-neutral-800 dark:text-neutral-200">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed text-sm md:text-base">
            {children}
          </li>
        ),
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto rounded-xl border border-neutral-200/80 dark:border-neutral-750 shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-neutral-100/80 dark:bg-neutral-850/80 border-b border-neutral-200/80 dark:border-neutral-750">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-neutral-150 dark:divide-neutral-800">
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-neutral-50/40 dark:hover:bg-neutral-800/20 odd:bg-white dark:odd:bg-neutral-900 even:bg-neutral-50/20 dark:even:bg-neutral-850/10">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="p-3 font-semibold text-neutral-900 dark:text-neutral-100">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="p-3 text-neutral-700 dark:text-neutral-300 align-top">
            {children}
          </td>
        ),
        code: ({ children, className, ...props }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-neutral-150 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-xs text-rose-600 dark:text-rose-450" {...props}>
              {children}
            </code>
          ) : (
            <pre className="my-4 p-4 rounded-xl bg-neutral-900 text-neutral-100 overflow-x-auto font-mono text-xs border border-neutral-800">
              <code className={className} {...props}>{children}</code>
            </pre>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

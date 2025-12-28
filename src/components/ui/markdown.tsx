"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { ComponentPropsWithoutRef } from "react";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
        rehypeHighlight,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ]}
      components={{
        // Custom heading components
        h1: ({ children, ...props }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 tracking-tight" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2 className="text-2xl font-bold mt-8 mb-4 tracking-tight" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 className="text-xl font-bold mt-6 mb-3 tracking-tight" {...props}>
            {children}
          </h3>
        ),
        h4: ({ children, ...props }) => (
          <h4 className="text-lg font-semibold mt-4 mb-2" {...props}>
            {children}
          </h4>
        ),
        // Paragraphs
        p: ({ children, ...props }) => (
          <p className="text-base leading-7 mb-4" {...props}>
            {children}
          </p>
        ),
        // Lists
        ul: ({ children, ...props }) => (
          <ul className="my-4 list-disc pl-6 space-y-2" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="my-4 list-decimal pl-6 space-y-2" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="text-base leading-7" {...props}>
            {children}
          </li>
        ),
        // Links
        a: ({ children, href, ...props }) => (
          <a
            href={href}
            className="text-primary hover:underline"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            {...props}
          >
            {children}
          </a>
        ),
        // Code blocks
        pre: ({ children, ...props }) => (
          <pre
            className="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm"
            {...props}
          >
            {children}
          </pre>
        ),
        code: ({ children, className, ...props }: ComponentPropsWithoutRef<"code">) => {
          // Check if it's an inline code or code block
          const isInline = !className;
          if (isInline) {
            return (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        // Blockquotes
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground"
            {...props}
          >
            {children}
          </blockquote>
        ),
        // Tables
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse border border-border" {...props}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children, ...props }) => (
          <thead className="bg-muted" {...props}>
            {children}
          </thead>
        ),
        th: ({ children, ...props }) => (
          <th className="border border-border px-4 py-2 text-left font-semibold" {...props}>
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td className="border border-border px-4 py-2" {...props}>
            {children}
          </td>
        ),
        // Horizontal rule
        hr: (props) => <hr className="my-8 border-border" {...props} />,
        // Strong/Bold
        strong: ({ children, ...props }) => (
          <strong className="font-semibold text-foreground" {...props}>
            {children}
          </strong>
        ),
        // Emphasis/Italic
        em: ({ children, ...props }) => (
          <em className="italic" {...props}>
            {children}
          </em>
        ),
        // Images
        img: ({ src, alt, ...props }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || ""}
            className="rounded-lg my-4 max-w-full h-auto"
            {...props}
          />
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

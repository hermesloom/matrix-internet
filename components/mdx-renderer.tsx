"use client";

import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface MDXRendererProps {
  content: string;
  author?: string;
  timestamp?: number;
}

const mdxComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-bold mb-6 text-foreground">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold mb-4 text-foreground">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-medium mb-3 text-foreground">{children}</h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-4 text-muted-foreground leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside mb-4 text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal list-inside mb-4 text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="mb-1">{children}</li>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
      <code className="text-sm font-mono">{children}</code>
    </pre>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-border pl-4 italic mb-4 text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-primary underline hover:no-underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <img src={src} alt={alt} className="max-w-full h-auto rounded-lg mb-4" />
  ),
  hr: () => <Separator className="my-6" />,
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border-collapse border border-border">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-border px-4 py-2">{children}</td>
  ),
};

export function MDXRenderer({ content, author, timestamp }: MDXRendererProps) {
  const [mdxSource, setMdxSource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const serializeContent = async () => {
      try {
        const serialized = await serialize(content);
        setMdxSource(serialized);
      } catch (error) {
        console.error("Failed to serialize MDX:", error);
        // Fallback to plain text rendering
        setMdxSource(null);
      } finally {
        setIsLoading(false);
      }
    };

    serializeContent();
  }, [content]);

  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(author || timestamp) && (
        <div className="flex items-center gap-2 pb-2 border-b">
          {author && <Badge variant="secondary">@{author}</Badge>}
          {formattedDate && (
            <span className="text-sm text-muted-foreground">
              {formattedDate}
            </span>
          )}
        </div>
      )}

      <Card className="p-6">
        <div className="prose prose-slate max-w-none">
          {mdxSource ? (
            <MDXRemote {...mdxSource} components={mdxComponents} />
          ) : (
            <pre className="whitespace-pre-wrap text-sm">{content}</pre>
          )}
        </div>
      </Card>
    </div>
  );
}

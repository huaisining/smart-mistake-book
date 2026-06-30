"use client";

import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import katex from "katex";

const md = new MarkdownIt({
  html: true,
  breaks: true,
});

export default function MarkdownWithMath({ content }: { content: string }) {
  const html = useMemo(() => {
    if (!content) return "";

    let text = content;

    // Render display math: $$...$$
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_: string, formula: string) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return `<pre>${formula}</pre>`;
      }
    });

    // Render inline math: $...$
    text = text.replace(/\$([^\$]+?)\$/g, (_: string, formula: string) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `$${formula}$`;
      }
    });

    // Render markdown
    return md.render(text);
  }, [content]);

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

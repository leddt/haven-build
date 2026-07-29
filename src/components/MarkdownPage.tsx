import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPage({ content }: { content: string }) {
  return (
    <article className="prose-guide">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}

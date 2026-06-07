import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="mt-4 text-2xl font-bold">{children}</h1>,
        h2: ({ children }) => <h2 className="mt-6 text-xl font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-5 text-base font-semibold">{children}</h3>,
        p: ({ children }) => <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-300">{children}</p>,
        li: ({ children }) => <li className="ml-5 list-disc leading-7 text-zinc-600 dark:text-zinc-300">{children}</li>,
        code: ({ children }) => <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">{children}</code>,
        pre: ({ children }) => <pre className="mt-4 overflow-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">{children}</pre>
      }}
    >
      {content || ""}
    </ReactMarkdown>
  );
}


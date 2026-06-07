import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  theme: "base",
  themeVariables: {
    primaryColor: "#ecfeff",
    primaryBorderColor: "#06b6d4",
    primaryTextColor: "#18181b",
    lineColor: "#71717a",
    tertiaryColor: "#f4f4f5"
  }
});

export function MermaidDiagram({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let mounted = true;
    mermaid.render(`mermaid-${id}`, chart || "graph TD\nA[No diagram]").then((result) => {
      if (mounted) setSvg(result.svg);
    }).catch(() => {
      if (mounted) setSvg("<p>Unable to render diagram</p>");
    });
    return () => {
      mounted = false;
    };
  }, [chart, id]);

  return <div className="overflow-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950" dangerouslySetInnerHTML={{ __html: svg }} />;
}


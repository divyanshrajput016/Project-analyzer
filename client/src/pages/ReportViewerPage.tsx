import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { api } from "../services/api";
import type { Report } from "../types";

export function ReportViewerPage() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    api.get(`/reports/${id}`).then((res) => setReport(res.data.report));
  }, [id]);

  if (!report) return <p className="text-sm text-zinc-500">Loading report...</p>;

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-3xl font-bold">{report.title}</h1>
          <p className="mt-2 text-zinc-500">{report.summary}</p>
        </div>
        <a href={`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/reports/${report._id}/export/markdown`} className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold">
          <Download className="h-4 w-4" />
          Markdown
        </a>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">Security Score</h2>
          <p className="mt-3 text-5xl font-bold text-cyan-700">{report.security.score}</p>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            {report.security.recommendations.map((item) => <p key={item}>{item}</p>)}
          </div>
        </section>
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">API Documentation</h2>
          <div className="mt-4 space-y-2">
            {report.apis.map((api) => <p key={`${api.method}-${api.path}-${api.file}`} className="rounded-md bg-zinc-50 px-3 py-2 font-mono text-sm">{api.method} {api.path}</p>)}
          </div>
        </section>
      </div>
      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold">Architecture Diagrams</h2>
        <pre className="mt-4 overflow-auto rounded-md bg-zinc-950 p-4 text-sm text-cyan-100">{report.architecture.systemDiagram}</pre>
      </section>
      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold">Report Markdown</h2>
        <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md bg-zinc-50 p-4 text-sm">{report.markdown}</pre>
      </section>
      <Link to="/reports" className="mt-6 inline-block text-sm font-semibold text-cyan-700">Back to reports</Link>
    </div>
  );
}


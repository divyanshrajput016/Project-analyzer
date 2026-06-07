import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Report } from "../types";

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/reports", { params: { search } }).then((res) => setReports(res.data.reports));
  }, [search]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">Saved Reports</h1>
        <input className="input md:w-80" placeholder="Search reports" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="mt-6 grid gap-4">
        {reports.map((report) => (
          <Link key={report._id} to={`/reports/${report._id}`} className="rounded-lg border border-zinc-200 bg-white p-5 hover:border-cyan-500">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{report.title}</h2>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold">v{report.version}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">{report.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.techStack.map((tech) => <span key={tech} className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800">{tech}</span>)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


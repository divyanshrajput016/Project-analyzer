import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { api } from "../services/api";
import type { Report } from "../types";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [tech, setTech] = useState("");

  useEffect(() => {
    api.get("/reports", { params: { search, tech } }).then((res) => setReports(res.data.reports));
  }, [search, tech]);

  const techOptions = useMemo(() => Array.from(new Set(reports.flatMap((report) => report.techStack))), [reports]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge tone="cyan">Knowledge base</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Saved reports</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Search, filter, reopen, compare, and export permanent repository intelligence reports.</p>
        </div>
        <Button asChild variant="accent"><Link to="/upload">New analysis</Link></Button>
      </section>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input className="pl-9" placeholder="Search by project, summary, repository URL" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select className="input w-56" value={tech} onChange={(e) => setTech(e.target.value)}>
              <option value="">All tech</option>
              {techOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Link key={report._id} to={`/reports/${report._id}`} className="group rounded-lg border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{report.title}</h2>
                  <Badge>v{report.version}</Badge>
                  <Badge tone={(report.security?.score || 0) > 75 ? "green" : "amber"}>{report.security?.score || 0}/100 security</Badge>
                </div>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">{report.summary}</p>
              </div>
              <div className="text-sm font-semibold text-cyan-600 opacity-0 transition group-hover:opacity-100">Open report</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.techStack.map((item) => <Badge key={item}>{item}</Badge>)}
            </div>
          </Link>
        ))}
        {!reports.length && <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800">No saved reports found.</p>}
      </div>
    </div>
  );
}


import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Database, FileText, GitBranch, LockKeyhole, Search, ShieldCheck, Upload } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";

const chartColors = ["#06b6d4", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#64748b"];

export function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  const stats = data?.stats || {};
  const languageData = objectToChart(data?.languageBreakdown);
  const repoStats = data?.repositoryStatistics || [];
  const recentReports = useMemo(() => {
    const items = data?.recentReports || [];
    return items.filter((item: any) => item.title?.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const cards = [
    { label: "Total Repositories", value: stats.totalProjectsAnalyzed || 0, icon: GitBranch, tone: "cyan" },
    { label: "Total Reports", value: stats.totalReports || 0, icon: FileText, tone: "default" },
    { label: "Total APIs", value: stats.totalApisDetected || 0, icon: Activity, tone: "green" },
    { label: "Total Models", value: stats.totalModelsDetected || 0, icon: Database, tone: "default" },
    { label: "Security Score", value: `${stats.averageSecurityScore || 0}/100`, icon: ShieldCheck, tone: "green" },
    { label: "Authentication", value: stats.authenticationType || "Mixed", icon: LockKeyhole, tone: "cyan" }
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge tone="cyan">Workspace</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Repository intelligence dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">Track analyzed repositories, security posture, technology usage, report activity, and engineering documentation readiness.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/reports">Browse reports</Link></Button>
          <Button asChild variant="accent"><Link to="/upload"><Upload className="h-4 w-4" />Analyze repo</Link></Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</span>
                  <span className="rounded-md bg-zinc-100 p-2 dark:bg-zinc-900"><card.icon className="h-4 w-4 text-cyan-500" /></span>
                </div>
                <p className="mt-4 text-3xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Repository Statistics</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repoStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="apis" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="models" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={languageData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={3}>
                  {languageData.map((_: any, index: number) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Security Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.securityTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line dataKey="score" stroke="#22c55e" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input className="pl-9" placeholder="Search recent reports" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReports.length === 0 && <p className="text-sm text-zinc-500">No reports yet.</p>}
            {recentReports.map((report: any) => (
              <Link key={report._id} to={`/reports/${report._id}`} className="block rounded-md border border-zinc-200 p-4 transition hover:border-cyan-400 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{report.title}</p>
                  <Badge>v{report.version}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{report.summary}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(data?.recentReports || []).slice(0, 5).map((report: any) => (
              <div key={report._id} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <div>
                  <p className="text-sm font-medium">Generated report for {report.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function objectToChart(value?: Record<string, number>) {
  const entries = Object.entries(value || {});
  if (!entries.length) return [{ name: "No data", value: 1 }];
  return entries.map(([name, count]) => ({ name, value: count }));
}


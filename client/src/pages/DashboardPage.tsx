import { useEffect, useState } from "react";
import { Activity, Database, FileText, GitBranch } from "lucide-react";
import { api } from "../services/api";

export function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  const stats = data?.stats || {};
  const cards = [
    { label: "Total Reports", value: stats.totalReports || 0, icon: FileText },
    { label: "Total APIs Detected", value: stats.totalApisDetected || 0, icon: GitBranch },
    { label: "Total Models Detected", value: stats.totalModelsDetected || 0, icon: Database },
    { label: "Projects Analyzed", value: stats.totalProjectsAnalyzed || 0, icon: Activity }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-zinc-200 bg-white p-5">
            <card.icon className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-sm text-zinc-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Recent Reports" items={data?.recentReports || []} />
        <Panel title="AI Chat History" items={data?.chatHistory || []} chat />
      </div>
    </div>
  );
}

function Panel({ title, items, chat = false }: { title: string; items: any[]; chat?: boolean }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="text-sm text-zinc-500">No data yet</p>}
        {items.map((item) => (
          <div key={item._id} className="rounded-md border border-zinc-100 p-3">
            <p className="font-medium">{chat ? item.question : item.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{chat ? item.answer : item.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


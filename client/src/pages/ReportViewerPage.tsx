import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, FileText, GitCompare, ShieldAlert, Sparkles } from "lucide-react";
import { api } from "../services/api";
import { apiUrl } from "../lib/utils";
import type { Report } from "../types";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MermaidDiagram } from "../components/MermaidDiagram";
import { MarkdownView } from "../components/MarkdownView";
import { CopyButton } from "../components/CopyButton";

const tabs = ["Overview", "Walkthrough", "Architecture", "APIs", "Database", "Authentication", "Security", "Quality", "Interview Questions", "Resume Kit", "README", "Compare"];

export function ReportViewerPage() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    api.get(`/reports/${id}`).then((res) => setReport(res.data.report));
  }, [id]);

  useEffect(() => {
    if (!report?.project) return;
    api.get(`/projects/${report.project}/compare`).then((res) => setComparison(res.data.comparison)).catch(() => setComparison(null));
  }, [report]);

  const securityTone = useMemo(() => {
    const score = report?.security?.score || 0;
    if (score >= 80) return "green";
    if (score >= 55) return "amber";
    return "red";
  }, [report]);

  if (!report) return <p className="text-sm text-zinc-500">Loading report...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <Badge tone="cyan">Version {report.version}</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{report.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">{report.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.techStack.map((tech) => <Badge key={tech}>{tech}</Badge>)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="accent" onClick={() => document.getElementById("walkthrough")?.scrollIntoView({ behavior: "smooth" })}><Sparkles className="h-4 w-4" />Explain Entire Project</Button>
            <Button asChild variant="outline"><a href={apiUrl(`/reports/${report._id}/export/markdown`)}><Download className="h-4 w-4" />Markdown</a></Button>
            <Button asChild variant="outline"><a href={apiUrl(`/reports/${report._id}/export/readme`)}><FileText className="h-4 w-4" />README</a></Button>
            <Button asChild variant="outline"><a href={apiUrl(`/reports/${report._id}/export/diagram`)}>Diagram</a></Button>
            <Button asChild variant="accent"><a href={apiUrl(`/reports/${report._id}/export/pdf`)}>PDF</a></Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="Overview">
        <div className="overflow-auto">
          <TabsList className="min-w-max">
            {tabs.map((tab) => <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>)}
          </TabsList>
        </div>

        <TabsContent value="Overview">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <Card>
              <CardHeader><CardTitle>Project Explanation Mode</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Explanation title="5-minute explanation" value={report.projectExplanations?.fiveMinute} />
                <Explanation title="10-minute explanation" value={report.projectExplanations?.tenMinute} />
                <Explanation title="Interview explanation" value={report.projectExplanations?.interview} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Quality Signals</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                {Object.entries(report.qualitySignals || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                    <span className="text-sm font-medium">{labelize(key)}</span>
                    <Badge tone={value ? "green" : "amber"}>{value ? "Detected" : "Missing"}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="Walkthrough">
          <Card id="walkthrough">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{report.repositoryWalkthrough?.title || "Explain Entire Project"}</CardTitle>
              <CopyButton value={report.repositoryWalkthrough?.explanation || ""} />
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-600 dark:text-zinc-300">{report.repositoryWalkthrough?.explanation}</p>
              <EvidenceList title="Walkthrough Evidence" items={report.repositoryWalkthrough?.evidence || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Architecture">
          <div className="grid gap-6">
            <LayerCards report={report} />
            <DiagramGrid report={report} />
            <Card>
              <CardHeader><CardTitle>Dependency Flow</CardTitle></CardHeader>
              <CardContent>
                <MermaidDiagram chart={report.architecture.dependencyDiagram || "graph TD\nFrontend --> Route\nRoute --> Controller\nController --> Service\nService --> Database"} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="APIs">
          <div className="grid gap-4">
            {report.apis.map((apiItem) => <ApiCard key={`${apiItem.method}-${apiItem.path}-${apiItem.file}`} apiItem={apiItem} />)}
            {!report.apis.length && <EmptyState text="No API routes detected." />}
          </div>
        </TabsContent>

        <TabsContent value="Database">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <CardHeader><CardTitle>Models</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[...(report.database.models || []), ...(report.database.prismaModels || [])].map((model) => (
                  <div key={`${model.name}-${model.file}`} className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                    <p className="font-semibold">{model.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{model.file}</p>
                    <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{model.purpose}</p>
                    {!!model.keyFields?.length && <div className="mt-3 flex flex-wrap gap-2">{model.keyFields.map((field) => <Badge key={field} tone="cyan">{field}</Badge>)}</div>}
                    <div className="mt-3 space-y-1 font-mono text-sm text-zinc-600 dark:text-zinc-300">
                      {(model.fields || []).map((field) => <p key={field}>├ {field}</p>)}
                    </div>
                    <EvidenceList title="Source" items={model.source ? [model.source] : []} compact />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Relationships</CardTitle></CardHeader>
              <CardContent>
                <MermaidDiagram chart={report.architecture.databaseDiagram || "graph TD\nDatabase --> Models"} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="Authentication">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <Card>
              <CardHeader><CardTitle>Authentication Flow</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <MermaidDiagram chart={report.architecture.authDiagram} />
                <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">{report.authentication.authorizationFlow}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Detected Locations</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <LocationList title="JWT generation" items={report.authentication.jwtGeneration || []} />
                <LocationList title="JWT verification" items={report.authentication.jwtVerification || []} />
                <LocationList title="Cookie settings" items={report.authentication.cookieSettings || []} />
              </CardContent>
            </Card>
          </div>
          <Card className="mt-6">
            <CardHeader><CardTitle>Protected Routes</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {(report.authentication.protectedRoutes || []).map((route) => (
                <div key={`${route.method}-${route.path}`} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="font-mono text-sm"><span className="font-bold text-cyan-600">{route.method}</span> {route.path}</p>
                  <p className="mt-2 text-xs text-zinc-500">Middleware: {route.middleware.join(" -> ")}</p>
                  <EvidenceList title="Source" items={route.source ? [route.source] : []} compact />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Public Routes</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                {(report.authentication.publicRoutes || []).map((route) => (
                  <div key={`${route.method}-${route.path}`} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                    <p className="font-mono text-sm"><span className="font-bold text-emerald-600">{route.method}</span> {route.path}</p>
                    <EvidenceList title="Source" items={route.source ? [route.source] : []} compact />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Logout / Token Invalidation</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">{report.authentication.logoutFlow?.explanation}</p>
                <EvidenceList title="Evidence" items={report.authentication.logoutFlow?.locations || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="Security">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <Card>
              <CardHeader><CardTitle>Security Score</CardTitle></CardHeader>
              <CardContent>
                <Badge tone={securityTone as any}>Security Analysis 2.0</Badge>
                <p className="mt-5 text-6xl font-bold">{report.security.score}</p>
                <p className="mt-2 text-sm text-zinc-500">Calculated from real security checks, cookie flags, rate limiting, upload safety, validation, and auth posture.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Issues Found</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(report.security.issues || []).map((issue) => (
                  <div key={`${issue.severity}-${issue.title}`} className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      <Badge tone={severityTone(issue.severity)}>{issue.severity}</Badge>
                      <p className="font-semibold">{issue.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{issue.recommendation}</p>
                    <EvidenceList title="Evidence" items={issue.evidence || []} compact />
                  </div>
                ))}
                {!(report.security.issues || []).length && <EmptyState text="No security issues detected." />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="Quality">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <Card>
              <CardHeader><CardTitle>Code Quality Score</CardTitle></CardHeader>
              <CardContent>
                <Badge tone={(report.codeQuality?.score || 0) > 75 ? "green" : "amber"}>Maintainability</Badge>
                <p className="mt-5 text-6xl font-bold">{report.codeQuality?.score || 0}</p>
                <p className="mt-2 text-sm text-zinc-500">{report.codeQuality?.summary}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Quality Findings</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(report.codeQuality?.issues || []).map((issue) => (
                  <div key={`${issue.title}-${issue.recommendation}`} className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Badge tone={severityTone(issue.severity)}>{issue.severity}</Badge>
                      <p className="font-semibold">{issue.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{issue.recommendation}</p>
                    <EvidenceList title="Evidence" items={issue.evidence || []} compact />
                  </div>
                ))}
                {!(report.codeQuality?.issues || []).length && <EmptyState text="No quality issues detected." />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="Interview Questions">
          <div className="grid gap-4 md:grid-cols-3">
            {["beginner", "intermediate", "advanced"].map((level) => (
              <Card key={level}>
                <CardHeader><CardTitle>{labelize(level)}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(report.interviewQuestions[level] || []).map((question) => <p key={question} className="rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-900">{question}</p>)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="README">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Generated README</CardTitle>
              <CopyButton value={report.readme || report.markdown} />
            </CardHeader>
            <CardContent>
              <MarkdownView content={report.readme || report.markdown} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Resume Kit">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between"><CardTitle>Resume Bullets</CardTitle><CopyButton value={(report.resumeKit?.resumeBullets || []).join("\n")} /></CardHeader>
              <CardContent className="space-y-3">{(report.resumeKit?.resumeBullets || []).map((item) => <p key={item} className="rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-900">{item}</p>)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between"><CardTitle>LinkedIn Description</CardTitle><CopyButton value={report.resumeKit?.linkedInDescription || ""} /></CardHeader>
              <CardContent><p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">{report.resumeKit?.linkedInDescription}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between"><CardTitle>2-minute Interview Pitch</CardTitle><CopyButton value={report.resumeKit?.twoMinutePitch || ""} /></CardHeader>
              <CardContent><p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">{report.resumeKit?.twoMinutePitch}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between"><CardTitle>GitHub README</CardTitle><CopyButton value={report.resumeKit?.githubReadme || report.readme || ""} /></CardHeader>
              <CardContent><MarkdownView content={report.resumeKit?.githubReadme || report.readme || ""} /></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="Compare">
          <Card>
            <CardHeader><CardTitle><GitCompare className="mr-2 inline h-5 w-5" />Version Compare</CardTitle></CardHeader>
            <CardContent>
              {!comparison && <EmptyState text="Analyze this repository again to compare versions." />}
              {comparison && <div className="grid gap-4 md:grid-cols-2">
                <CompareBlock title="New APIs" items={comparison.addedApis || []} />
                <CompareBlock title="Removed APIs" items={comparison.removedApis || []} />
                <CompareBlock title="Changed Models" items={comparison.changedModels || []} />
                <CompareBlock title="Removed Models" items={comparison.removedModels || []} />
                <CompareBlock title="Added Dependencies" items={comparison.changedDependencies?.added || []} />
                <CompareBlock title="Removed Dependencies" items={comparison.changedDependencies?.removed || []} />
                <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="font-semibold">Security Score</p>
                  <p className="mt-2 text-sm text-zinc-500">{comparison.changedSecurityScore?.previous} {"->"} {comparison.changedSecurityScore?.current} ({comparison.changedSecurityScore?.delta >= 0 ? "+" : ""}{comparison.changedSecurityScore?.delta})</p>
                </div>
                <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="font-semibold">Architecture Changed</p>
                  <p className="mt-2 text-sm text-zinc-500">{comparison.changedArchitecture ? "Yes" : "No"}</p>
                </div>
              </div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Link to="/reports" className="inline-block text-sm font-semibold text-cyan-600">Back to reports</Link>
    </div>
  );
}

function Explanation({ title, value }: { title: string; value?: string }) {
  return <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800"><p className="font-semibold">{title}</p><p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{value}</p></div>;
}

function LayerCards({ report }: { report: Report }) {
  const layers = report.architecture.layers || {};
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {["frontend", "backend", "database", "authentication"].map((layer) => (
        <Card key={layer}>
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500">{labelize(layer)}</p>
            <p className="mt-2 font-semibold">{(layers[layer] || []).join(", ") || "Not detected"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DiagramGrid({ report }: { report: Report }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card><CardHeader><CardTitle>System Diagram</CardTitle></CardHeader><CardContent><MermaidDiagram chart={report.architecture.systemDiagram} /></CardContent></Card>
      <Card><CardHeader><CardTitle>API Flow</CardTitle></CardHeader><CardContent><MermaidDiagram chart={report.architecture.apiDiagram} /></CardContent></Card>
    </div>
  );
}

function ApiCard({ apiItem }: { apiItem: Report["apis"][number] }) {
  const payload = JSON.stringify({ request: apiItem.request || [], response: apiItem.response || [] }, null, 2);
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <p className="font-mono text-sm"><span className="font-bold text-cyan-600">{apiItem.method}</span> {apiItem.path}</p>
            <p className="mt-2 text-sm text-zinc-500">{apiItem.description}</p>
          </div>
          <CopyButton value={`${apiItem.method} ${apiItem.path}`} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InfoBlock label="Controller" value={apiItem.controller || "inline"} />
          <InfoBlock label="Middleware" value={(apiItem.middleware || []).join(" -> ") || "none"} />
          <InfoBlock label="Source" value={apiItem.file} />
          <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase text-zinc-500">Payload</p><CopyButton value={payload} /></div>
            <pre className="mt-2 overflow-auto text-xs">{payload}</pre>
          </div>
        </div>
        {apiItem.flowTrace && (
          <div className="mt-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm font-semibold">Route Flow Trace</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {apiItem.flowTrace.steps.map((step, index) => (
                <span key={`${step}-${index}`} className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium dark:bg-zinc-900">{step}</span>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <EvidenceList title="Route" items={[apiItem.flowTrace.route]} compact />
              <EvidenceList title="Controller" items={apiItem.flowTrace.controller.source ? [apiItem.flowTrace.controller.source] : []} compact />
              <EvidenceList title="Middleware" items={apiItem.flowTrace.middleware.map((item) => item.source).filter(Boolean) as any} compact />
              <EvidenceList title="Service / Helper" items={apiItem.flowTrace.services.map((item) => item.source)} compact />
              <EvidenceList title="Database / Model" items={apiItem.flowTrace.models.map((item) => item.source)} compact />
              <EvidenceList title="External API" items={apiItem.flowTrace.externalApis.map((item) => item.source)} compact />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-900"><p className="text-xs font-semibold uppercase text-zinc-500">{label}</p><p className="mt-2 break-words text-sm">{value}</p></div>;
}

function LocationList({ title, items }: { title: string; items: Array<{ file: string; line: number; code: string }> }) {
  return <EvidenceList title={title} items={items} compact />;
}

function EvidenceList({ title, items, compact = false }: { title: string; items: Array<{ file: string; line: number; code?: string }>; compact?: boolean }) {
  return (
    <div className={compact ? "mt-3" : ""}>
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-2 space-y-2">
        {items.length === 0 && <p className="text-xs text-zinc-500">No source evidence detected.</p>}
        {items.map((item) => (
          <div key={`${item.file}-${item.line}-${item.code}`} className="rounded-md bg-zinc-50 p-2 dark:bg-zinc-900">
            <p className="font-mono text-xs text-cyan-700 dark:text-cyan-300">{item.file}:{item.line}</p>
            {item.code && !compact && <p className="mt-1 break-words font-mono text-xs text-zinc-500">{item.code}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompareBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="font-semibold">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length === 0 && <p className="text-sm text-zinc-500">No changes</p>}
        {items.map((item) => <p key={item} className="rounded bg-zinc-50 px-2 py-1 text-sm dark:bg-zinc-900">{item}</p>)}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800">{text}</p>;
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function severityTone(severity: string) {
  if (severity === "Critical" || severity === "High") return "red";
  if (severity === "Medium") return "amber";
  return "default";
}

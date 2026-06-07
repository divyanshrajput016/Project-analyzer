import { FormEvent, useEffect, useState } from "react";
import { Bot, Mic, Send } from "lucide-react";
import { api } from "../services/api";
import type { Project } from "../types";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";

export function InterviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [interview, setInterview] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    api.get("/projects").then((res) => {
      setProjects(res.data.projects);
      setProjectId(res.data.projects[0]?._id || "");
    });
  }, []);

  useEffect(() => {
    if (projectId) api.get(`/interview/${projectId}`).then((res) => setInterview(res.data.interview));
  }, [projectId]);

  function submitMock(e: FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    setFeedback("Good structure. Strengthen the answer by naming the route, controller, middleware, database model, and one security tradeoff from this repository.");
    setAnswer("");
  }

  const questions = interview?.questions || {};

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge tone="cyan">Interview Mode</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Explain it like you built it</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Prepare project-specific answers for recruiters, technical screens, and portfolio walkthroughs.</p>
        </div>
        <select className="input md:w-72" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}
        </select>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader><CardTitle>Project Explanation</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {Object.entries(interview?.explanations || {}).map(([key, value]) => (
              <div key={key} className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="font-semibold">{labelize(key)}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{String(value)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mock Interview</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md bg-zinc-50 p-4 dark:bg-zinc-900">
              <div className="flex items-center gap-2"><Mic className="h-4 w-4 text-cyan-500" /><p className="font-semibold">Prompt</p></div>
              <p className="mt-2 text-sm text-zinc-500">Walk me through the authentication flow and explain why the implementation is production-ready or not.</p>
            </div>
            <form onSubmit={submitMock} className="mt-4 flex gap-2">
              <Input placeholder="Type your answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
              <Button><Send className="h-4 w-4" />Submit</Button>
            </form>
            {feedback && <div className="mt-4 rounded-md border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-100"><Bot className="mb-2 h-4 w-4" />{feedback}</div>}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="beginner">
        <TabsList>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        {["beginner", "intermediate", "advanced"].map((level) => (
          <TabsContent key={level} value={level}>
            <div className="grid gap-3 md:grid-cols-2">
              {(questions[level] || []).map((question: string) => <Card key={question}><CardContent className="p-4 text-sm font-medium">{question}</CardContent></Card>)}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}


import { FormEvent, useEffect, useState } from "react";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";
import { api } from "../services/api";
import type { Project } from "../types";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { MarkdownView } from "../components/MarkdownView";

const suggestions = [
  "Explain authentication flow",
  "Explain database schema",
  "Generate interview questions",
  "Find security issues",
  "Explain login process"
];

export function ChatPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [question, setQuestion] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/projects").then((res) => {
      setProjects(res.data.projects);
      setProjectId(res.data.projects[0]?._id || "");
    });
  }, []);

  useEffect(() => {
    if (projectId) api.get(`/chat/${projectId}`).then((res) => setChats(res.data.chats));
  }, [projectId]);

  async function ask(e?: FormEvent, override?: string) {
    e?.preventDefault();
    const prompt = override || question;
    if (!projectId || !prompt) return;
    setLoading(true);
    const res = await api.post(`/chat/${projectId}`, { question: prompt });
    setChats((items) => [...items, res.data.chat]);
    setQuestion("");
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge tone="cyan">Repository RAG</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">AI repository chat</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Ask questions grounded in the saved CodeAtlas report. Answers stay inside repository context.</p>
        </div>
        <select className="input md:w-72" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}
        </select>
      </section>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <Button key={item} type="button" variant="outline" size="sm" onClick={() => ask(undefined, item)}>
            <Sparkles className="h-4 w-4" />
            {item}
          </Button>
        ))}
      </div>

      <Card className="min-h-[520px]">
        <CardContent className="space-y-6 p-5">
          {chats.length === 0 && (
            <div className="flex min-h-[420px] items-center justify-center text-center">
              <div>
                <Bot className="mx-auto h-10 w-10 text-cyan-500" />
                <p className="mt-4 font-semibold">Ask about routes, controllers, auth, database models, APIs, or security.</p>
                <p className="mt-2 text-sm text-zinc-500">Suggested prompts above are a good starting point.</p>
              </div>
            </div>
          )}
          {chats.map((chat) => (
            <div key={chat._id} className="space-y-4">
              <Message role="user" content={chat.question} />
              <Message role="assistant" content={chat.answer} sources={extractSources(chat.answer)} />
            </div>
          ))}
          {loading && <Message role="assistant" content="Thinking through the repository context..." />}
        </CardContent>
      </Card>

      <form onSubmit={ask} className="sticky bottom-4 flex gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <Input placeholder="Ask a repository-specific question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Button disabled={loading}><Send className="h-4 w-4" />Send</Button>
      </form>
    </div>
  );
}

function Message({ role, content, sources = [] }: { role: "user" | "assistant"; content: string; sources?: string[] }) {
  const Icon = role === "user" ? UserRound : Bot;
  return (
    <div className={`flex gap-3 ${role === "user" ? "justify-end" : "justify-start"}`}>
      {role === "assistant" && <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200"><Icon className="h-4 w-4" /></span>}
      <div className={`max-w-[82%] rounded-lg px-4 py-3 ${role === "user" ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "bg-zinc-50 dark:bg-zinc-900"}`}>
        {role === "assistant" ? <MarkdownView content={content} /> : <p className="text-sm">{content}</p>}
        {!!sources.length && <div className="mt-4 flex flex-wrap gap-2">{sources.map((source) => <Badge key={source}>Source: {source}</Badge>)}</div>}
      </div>
      {role === "user" && <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-900"><Icon className="h-4 w-4" /></span>}
    </div>
  );
}

function extractSources(content: string) {
  const matches = content.match(/[\w./-]+(?:Controller|Routes|Middleware|Model|Service)?\.js/g) || [];
  return Array.from(new Set(matches)).slice(0, 4);
}


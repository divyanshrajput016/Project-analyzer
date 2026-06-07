import { FormEvent, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { api } from "../services/api";
import type { Project } from "../types";

export function ChatPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [question, setQuestion] = useState("");
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    api.get("/projects").then((res) => {
      setProjects(res.data.projects);
      setProjectId(res.data.projects[0]?._id || "");
    });
  }, []);

  useEffect(() => {
    if (projectId) api.get(`/chat/${projectId}`).then((res) => setChats(res.data.chats));
  }, [projectId]);

  async function ask(e: FormEvent) {
    e.preventDefault();
    if (!projectId || !question) return;
    const res = await api.post(`/chat/${projectId}`, { question });
    setChats((items) => [...items, res.data.chat]);
    setQuestion("");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">AI Repository Chat</h1>
      <select className="input mt-6 max-w-lg" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
        {projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}
      </select>
      <div className="mt-6 min-h-[420px] rounded-lg border border-zinc-200 bg-white p-5">
        <div className="space-y-4">
          {chats.map((chat) => (
            <div key={chat._id} className="rounded-md bg-zinc-50 p-4">
              <p className="font-semibold">{chat.question}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">{chat.answer}</p>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={ask} className="mt-4 flex gap-3">
        <input className="input" placeholder="Ask about auth, middleware, database schema, APIs, or a specific file" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <button className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"><Send className="h-4 w-4" />Ask</button>
      </form>
    </div>
  );
}


import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Github, Loader2, Upload } from "lucide-react";
import { api } from "../services/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export function UploadPage() {
  const navigate = useNavigate();
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState("");

  async function analyzeUrl(e: FormEvent) {
    e.preventDefault();
    setLoading("url");
    const res = await api.post("/projects/analyze-url", { repositoryUrl });
    navigate(`/reports/${res.data.report._id}`);
  }

  async function analyzeZip(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading("zip");
    const formData = new FormData();
    formData.append("repository", file);
    const res = await api.post("/projects/analyze-zip", formData);
    navigate(`/reports/${res.data.report._id}`);
  }

  return (
    <div className="space-y-6">
      <section>
        <Badge tone="cyan">Analysis engine</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Analyze a repository</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">Upload source code and CodeAtlas will generate architecture, API, database, auth, security, README, chat, and interview intelligence.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><Github className="h-6 w-6 text-cyan-500" /><CardTitle>GitHub URL</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={analyzeUrl} className="space-y-4">
              <Input placeholder="https://github.com/user/repo" value={repositoryUrl} onChange={(e) => setRepositoryUrl(e.target.value)} />
              <Button disabled={loading === "url"} variant="accent" className="w-full">{loading === "url" && <Loader2 className="h-4 w-4 animate-spin" />}Analyze public repository</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><Upload className="h-6 w-6 text-cyan-500" /><CardTitle>ZIP Upload</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={analyzeZip} className="space-y-4">
              <Input type="file" accept=".zip" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Button disabled={loading === "zip"} variant="accent" className="w-full">{loading === "zip" && <Loader2 className="h-4 w-4 animate-spin" />}Analyze ZIP archive</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Github, Upload } from "lucide-react";
import { api } from "../services/api";

export function UploadPage() {
  const navigate = useNavigate();
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyzeUrl(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await api.post("/projects/analyze-url", { repositoryUrl });
    navigate(`/reports/${res.data.report._id}`);
  }

  async function analyzeZip(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("repository", file);
    const res = await api.post("/projects/analyze-zip", formData);
    navigate(`/reports/${res.data.report._id}`);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Repository Upload</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={analyzeUrl} className="rounded-lg border border-zinc-200 bg-white p-6">
          <Github className="h-6 w-6 text-cyan-700" />
          <h2 className="mt-4 text-xl font-semibold">GitHub URL</h2>
          <input className="input mt-4" placeholder="https://github.com/user/repo" value={repositoryUrl} onChange={(e) => setRepositoryUrl(e.target.value)} />
          <button disabled={loading} className="btn-primary mt-4">{loading ? "Analyzing..." : "Analyze URL"}</button>
        </form>
        <form onSubmit={analyzeZip} className="rounded-lg border border-zinc-200 bg-white p-6">
          <Upload className="h-6 w-6 text-cyan-700" />
          <h2 className="mt-4 text-xl font-semibold">ZIP Upload</h2>
          <input className="input mt-4" type="file" accept=".zip" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button disabled={loading} className="btn-primary mt-4">{loading ? "Analyzing..." : "Analyze ZIP"}</button>
        </form>
      </div>
    </div>
  );
}


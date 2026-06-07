import { Link } from "react-router-dom";
import { ArrowRight, Github, ShieldCheck } from "lucide-react";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="text-xl font-bold">CodeAtlas</div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-md px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white">Login</Link>
          <Link to="/register" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-950">Start</Link>
        </div>
      </nav>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1fr_0.8fr] lg:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
            <ShieldCheck className="h-4 w-4" />
            AI repository reports saved permanently
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-tight lg:text-7xl">CodeAtlas</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Upload a GitHub URL or ZIP file and generate architecture documentation, API references, security analysis, README drafts, diagrams, and interview questions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-5 py-3 text-sm font-bold text-zinc-950">
              Analyze a repository
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-100">
              <Github className="h-4 w-4" />
              Open workspace
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
          <div className="rounded-md bg-zinc-950 p-4 font-mono text-sm text-zinc-300">
            <p className="text-emerald-300">POST /api/projects/analyze-url</p>
            <p className="mt-4">Architecture: Frontend {"->"} Backend {"->"} Database {"->"} AI</p>
            <p className="mt-2">Security score: 86/100</p>
            <p className="mt-2">Detected APIs: 24</p>
            <p className="mt-2">Detected models: 7</p>
          </div>
        </div>
      </section>
    </main>
  );
}

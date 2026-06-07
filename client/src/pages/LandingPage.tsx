import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bot, FileText, Github, ShieldCheck, Workflow } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050506] text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-black text-zinc-950">CA</span>
          <span className="text-xl font-bold">CodeAtlas</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost"><Link to="/login">Login</Link></Button>
          <Button asChild variant="accent"><Link to="/register">Start analyzing</Link></Button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_0.85fr] lg:py-28">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <Badge tone="cyan">AI-powered repository intelligence</Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">CodeAtlas</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Turn any repository into recruiter-ready explanations, visual architecture diagrams, Swagger-like API docs, security analysis, database maps, README files, and interview prep.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent"><Link to="/register">Analyze a repository<ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/login"><Github className="h-4 w-4" />Open workspace</Link></Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
          <div className="rounded-md border border-zinc-800 bg-[#09090b] p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <p className="font-semibold">Repository Report</p>
              <Badge tone="green">86/100 security</Badge>
            </div>
            <div className="mt-5 grid gap-3">
              <Feature icon={Workflow} title="Architecture" text="Frontend -> Backend -> Database -> AI" />
              <Feature icon={FileText} title="APIs" text="Swagger-like route cards with controllers and middleware" />
              <Feature icon={ShieldCheck} title="Security" text="Helmet, cookies, JWT expiry, validation, uploads, CORS" />
              <Feature icon={Bot} title="Chat" text="Ask repository-grounded questions with source citations" />
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof Workflow; title: string; text: string }) {
  return <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-4"><Icon className="h-5 w-5 text-cyan-300" /><p className="mt-3 font-semibold">{title}</p><p className="mt-1 text-sm text-zinc-400">{text}</p></div>;
}


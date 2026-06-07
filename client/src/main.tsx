import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">CodeAtlas</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight">
          Repository intelligence for teams that need to understand code quickly.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          Analyze GitHub URLs or ZIP projects, generate architecture docs, API references,
          security reviews, interview prep, and persistent AI reports.
        </p>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


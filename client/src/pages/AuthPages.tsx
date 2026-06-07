import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid login details");
    }
  }

  return <AuthShell title="Login" footer={<Link to="/register">Create account</Link>} onSubmit={handleSubmit} error={error}>
    <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
    <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
    <button className="btn-primary">Login</button>
  </AuthShell>;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch {
      setError("Unable to create account");
    }
  }

  return <AuthShell title="Register" footer={<Link to="/login">Already have an account</Link>} onSubmit={handleSubmit} error={error}>
    <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
    <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
    <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
    <button className="btn-primary">Create account</button>
  </AuthShell>;
}

function AuthShell({ title, children, footer, onSubmit, error }: { title: string; children: React.ReactNode; footer: React.ReactNode; onSubmit: (e: FormEvent) => void; error: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border border-zinc-800 bg-white p-8 text-zinc-950 shadow-2xl">
        <Link to="/" className="text-sm font-bold text-cyan-700">CodeAtlas</Link>
        <h1 className="mt-4 text-3xl font-bold">{title}</h1>
        <div className="mt-6 space-y-4">{children}</div>
        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-5 text-sm text-zinc-600">{footer}</div>
      </form>
    </main>
  );
}

